import { supabase } from '../supabaseClient';
import { ComparisonResult } from '../types';

export const saveAnalysisResultToSupabase = async (
  referenceFilename: string,
  analysisFilename: string,
  results: ComparisonResult[]
) => {
  // We cast import.meta to any to avoid TypeScript errors when vite types are not explicitly configured
  const env = (import.meta as any).env;

  // 1. ตรวจสอบการตั้งค่า (Optional: ถ้าไม่มี key ก็ไม่ทำอะไร หรือจะ throw error ก็ได้)
  if (!env?.VITE_SUPABASE_URL || !env?.VITE_SUPABASE_ANON_KEY) {
    console.warn('Supabase credentials not found. Skipping database save.');
    return;
  }

  try {
    // 2. บันทึกข้อมูลลงตาราง analyses (Header)
    const { data: analysisData, error: analysisError } = await supabase
      .from('analyses')
      .insert([
        {
          reference_filename: referenceFilename,
          analysis_filename: analysisFilename,
        },
      ])
      .select()
      .single();

    if (analysisError) {
      throw new Error(`Error inserting analysis: ${analysisError.message}`);
    }

    if (!analysisData) {
      throw new Error('No data returned after analysis insertion');
    }

    const analysisId = analysisData.id;

    // 3. เตรียมข้อมูลสำหรับตาราง analysis_results (Detail)
    const detailRows = results.map((item) => ({
      analysis_id: analysisId,
      topic: item.topic,
      reference_value: item.referenceValue,
      analysis_value: item.analysisValue,
      is_pass: item.comparison.pass,
      reason: item.comparison.reason,
    }));

    // 4. บันทึกข้อมูลลงตาราง analysis_results
    const { error: resultsError } = await supabase
      .from('analysis_results')
      .insert(detailRows);

    if (resultsError) {
      throw new Error(`Error inserting results: ${resultsError.message}`);
    }

    console.log('Successfully saved analysis to Supabase');
    return true;
  } catch (error) {
    console.error('Supabase Save Error:', error);
    // เราจะไม่ throw error ออกไปเพื่อให้ App ทำงานต่อได้ แม้จะบันทึก Database ไม่สำเร็จ
    // แต่ถ้าต้องการแจ้งเตือนผู้ใช้ สามารถ throw ได้
    return false;
  }
};