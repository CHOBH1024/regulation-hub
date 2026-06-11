import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const uploadPdf = async (file: File, path: string) => {
  if (supabaseUrl.includes('placeholder')) {
    console.warn('Supabase is not configured. Simulating upload...');
    return { data: { path: `/pdfs/${file.name}` }, error: null };
  }

  const { data, error } = await supabase.storage
    .from('pdfs')
    .upload(path, file, { upsert: true });
    
  return { data, error };
};
