// ============================================================
// HƯỚNG DẪN: Copy file này thành environment.ts và điền giá trị thật
// KHÔNG commit environment.ts lên Git (đã được thêm vào .gitignore)
// ============================================================
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  supabase: {
    url: 'https://YOUR_PROJECT_ID.supabase.co',
    anonKey: 'YOUR_SUPABASE_ANON_KEY_HERE'
  }
};
