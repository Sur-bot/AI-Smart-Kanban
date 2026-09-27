const url = 'https://mnsnhzczrxtfibdntqbt.supabase.co/auth/v1/signup';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uc25oemN6cnh0ZmliZG50cWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MDgwNTIsImV4cCI6MjEwMDI4NDA1Mn0.XhH9s4kcp3YshJk4PaProQhA-KF8QNFiqQyWYAa04oQ';

fetch(url, {
  method: 'POST',
  headers: {
    'apikey': anonKey,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ email: 'test@gmail.com', password: 'ValidPass@123' })
})
.then(res => res.text().then(text => ({ status: res.status, text })))
.then(console.log)
.catch(console.error);
