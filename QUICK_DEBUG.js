// ============================================
// DIAGNÓSTICO RÁPIDO - Ejecuta esto en la consola del navegador (F12)
// ============================================

// 1. Ver qué hay en localStorage
console.log('=== LOCALSTORAGE ===')
Object.keys(localStorage).forEach(key => {
  if (key.includes('supabase')) {
    console.log(key + ':', localStorage.getItem(key))
  }
})

// 2. Ver sesión actual
console.log('\n=== SESIÓN ACTUAL ===')
const { data: sessionData } = await supabase.auth.getSession()
console.log('Session:', sessionData.session)
console.log('User:', sessionData.session?.user)

// 3. Si hay sesión, ver si existe en la tabla users
if (sessionData.session?.user) {
  console.log('\n=== USUARIO EN DB ===')
  const { data: userData, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', sessionData.session.user.id)
    .single()
  
  console.log('User data:', userData)
  console.log('Error:', error)
}
