const { createClient } = require('@supabase/supabase-js');
const url = 'https://mnsnhzczrxtfibdntqbt.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uc25oemN6cnh0ZmliZG50cWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MDgwNTIsImV4cCI6MjEwMDI4NDA1Mn0.XhH9s4kcp3YshJk4PaProQhA-KF8QNFiqQyWYAa04oQ';

const supabase = createClient(url, anonKey);

async function test() {
  const { data, error } = await supabase.auth.signUp({
    email: 'test@gmail.com',
    password: 'ValidPass@123'
  });
  console.log('DATA:', JSON.stringify(data, null, 2));
  console.log('ERROR:', error);
}

test();
