import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iqqmujubdzhhcthtmehm.supabase.co';
const supabaseAnonKey = 'sb_publishable_zd-Gy3eW4bgyTA0L0EfFxg_fSyXhhdk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkBuckets() {
  try {
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ Error fetching buckets:', error.message);
      return;
    }
    
    console.log('✅ Found Buckets:', data.map(b => b.name));
  } catch (err) {
    console.error('❌ Exception:', err);
  }
}

checkBuckets();
