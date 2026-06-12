import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://iqqmujubdzhhcthtmehm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_zd-Gy3eW4bgyTA0L0EfFxg_fSyXhhdk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const uploadPdf = async (file: File, path: string) => {
  const { data, error } = await supabase.storage
    .from('pdfs')
    .upload(path, file, { upsert: true });

  if (error) return { data: null, publicUrl: null, error };

  const { data: urlData } = supabase.storage.from('pdfs').getPublicUrl(path);
  return { data, publicUrl: urlData.publicUrl, error: null };
};
