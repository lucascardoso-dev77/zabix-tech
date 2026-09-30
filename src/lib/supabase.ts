import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  // Não expomos chaves nem lançamos erro em produção; apenas alertamos no console
  // para facilitar o diagnóstico durante o setup local.
  console.warn(
    '[Zabix Tech] Variáveis VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY não configuradas. ' +
      'Copie .env.example para .env e preencha com os dados do seu projeto Supabase.'
  )
}

// Propositalmente sem o genérico <Database> do supabase-js: o schema evolui rápido
// durante o desenvolvimento deste portal e uma tipagem estrita aqui tende a quebrar
// a cada nova coluna. Os tipos de cada tabela (em src/types/database.ts) são aplicados
// via cast (`as Ticket[]`, etc.) no ponto de uso — veja os componentes de página.
// Para tipagem 100% estrita gerada a partir do banco real, rode:
//   supabase gen types typescript --project-id SEU_PROJETO > src/types/database.ts
//
// A chave "anon" é pública por design (protegida pelas políticas de RLS no banco).
// Nunca coloque a service_role key no frontend.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
