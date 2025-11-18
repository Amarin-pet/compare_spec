import { GoogleGenAI, Type } from "@google/genai";
import { ComparisonResult } from '../types';

const fileToGenerativePart = async (file: File) => {
  const base64EncodedData = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
};

export const analyzeDocuments = async (referenceFile: File, analysisFile: File): Promise<ComparisonResult[]> => {
  // FIX: Switched from import.meta.env.VITE_API_KEY to process.env.API_KEY to align with Gemini API guidelines and resolve TypeScript errors.
  if (!process.env.API_KEY) {
    throw new Error("API key is not configured. Please set the API_KEY environment variable.");
  }
  
  // FIX: Switched from import.meta.env.VITE_API_KEY to process.env.API_KEY as per guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const referenceFilePart = await fileToGenerativePart(referenceFile);
  const analysisFilePart = await fileToGenerativePart(analysisFile);

  const prompt = `คุณคือผู้ช่วย AI ผู้เชี่ยวชาญด้านการวิเคราะห์เอกสาร กรุณาวิเคราะห์เอกสารสองฉบับนี้: 'เอกสารอ้างอิง' และ 'เอกสารสำหรับวิเคราะห์'

เป้าหมายของคุณคือการเปรียบเทียบข้อมูลจำเพาะ (specifications) และราคาที่ปรากฏใน 'เอกสารสำหรับวิเคราะห์' กับ 'เอกสารอ้างอิง'

**คำสั่ง:**
1.  ระบุหัวข้อข้อมูลจำเพาะและราคาจาก 'เอกสารอ้างอิง'
2.  ค้นหาค่าที่สอดคล้องกันใน 'เอกสารสำหรับวิเคราะห์'
3.  สร้างผลลัพธ์ในรูปแบบ JSON array ตาม schema ที่กำหนด
4.  สำหรับแต่ละหัวข้อ ให้ทำการประเมินใน property 'comparison' โดยระบุว่า 'ผ่าน' (pass: true) หรือ 'ไม่ผ่าน' (pass: false)
    *   **'ผ่าน'** หมายถึง ค่าใน 'เอกสารสำหรับวิเคราะห์' ตรงกันหรือดีกว่าค่าใน 'เอกสารอ้างอิง' (เช่น ราคาต่ำกว่า, สเปคสูงกว่า)
    *   **'ไม่ผ่าน'** หมายถึง ค่าใน 'เอกสารสำหรับวิเคราะห์' ไม่ตรงกันหรือไม่เป็นไปตามเกณฑ์ของ 'เอกสารอ้างอิง'
5.  ให้คำอธิบายเหตุผลสั้นๆ สำหรับการประเมินใน 'reason'

กรุณาอย่าใส่ข้อความอื่นใดนอกเหนือจาก JSON array ที่เป็นผลลัพธ์
`;

  const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        topic: { type: Type.STRING, description: "หัวข้อที่เปรียบเทียบ เช่น CPU, RAM, ราคา" },
        referenceValue: { type: Type.STRING, description: "ค่าของหัวข้อจากไฟล์อ้างอิง" },
        analysisValue: { type: Type.STRING, description: "ค่าของหัวข้อจากไฟล์ที่ต้องการวิเคราะห์" },
        comparison: {
          type: Type.OBJECT,
          properties: {
            pass: { type: Type.BOOLEAN, description: "ผลการเปรียบเทียบว่าผ่านเกณฑ์หรือไม่ (true/false)" },
            reason: { type: Type.STRING, description: "คำอธิบายเหตุผลของผลการเปรียบเทียบ" },
          },
          required: ["pass", "reason"],
        },
      },
      required: ["topic", "referenceValue", "analysisValue", "comparison"],
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          referenceFilePart,
          { text: "เอกสารอ้างอิง" },
          analysisFilePart,
          { text: "เอกสารสำหรับวิเคราะห์" },
          { text: prompt },
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema,
      },
    });

    const jsonText = response.text?.trim();
    if (!jsonText) {
      throw new Error("ไม่สามารถสื่อสารกับ AI ได้ หรือผลลัพธ์ที่ได้เป็นค่าว่าง");
    }
    const resultData = JSON.parse(jsonText);
    return resultData as ComparisonResult[];
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("ไม่สามารถสื่อสารกับ AI ได้ หรือผลลัพธ์ที่ได้ไม่ถูกต้อง");
  }
};
