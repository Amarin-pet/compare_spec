import { createClient } from '@supabase/supabase-js';

// ตรวจสอบว่ามีการตั้งค่า Environment Variable หรือไม่
// หมายเหตุ: ในการใช้งานจริงบน Production ควรตรวจสอบค่าเหล่านี้ให้แน่ชัด
// We cast import.meta to any to avoid TypeScript errors when vite types are not explicitly configured
const env = (import.meta as any).env;
const supabaseUrl = env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env?.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);