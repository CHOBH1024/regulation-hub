import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://iqqmujubdzhhcthtmehm.supabase.co';
const supabaseAnonKey = 'sb_publishable_zd-Gy3eW4bgyTA0L0EfFxg_fSyXhhdk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testUpload() {
  try {
    const fileContent = 'Dummy PDF content for testing';
    
    console.log('Uploading to Supabase Storage...');
    const { data, error } = await supabase.storage
      .from('pdfs')
      .upload('test_upload.pdf', fileContent, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (error) {
      console.error('❌ Upload Failed:', error.message);
      process.exit(1);
    }

    console.log('✅ Upload Success:', data);
    
    // Clean up
    console.log('Cleaning up test file...');
    await supabase.storage.from('pdfs').remove(['test_upload.pdf']);
    console.log('✅ Clean up Success');
    
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

testUpload();
