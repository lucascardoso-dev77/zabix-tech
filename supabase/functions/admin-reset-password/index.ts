// Supabase Edge Function: admin-reset-password
//
// Permite que um administrador defina instantaneamente uma nova senha temporária
// para outro usuário — útil quando o e-mail transacional do projeto ainda não
// está configurado. Assim como admin-create-user, a service_role key só existe
// aqui no servidor.
//
// Deploy:
//   supabase functions deploy admin-reset-password
//
// Chamada pelo frontend (usuário já autenticado como admin):
//   supabase.functions.invoke('admin-reset-password', { body: { userId } })

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Não autenticado.' }, 401)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const {
      data: { user: caller },
      error: callerError,
    } = await callerClient.auth.getUser()

    if (callerError || !caller) return json({ error: 'Sessão inválida.' }, 401)

    const { data: callerProfile } = await callerClient
      .from('profiles')
      .select('role')
      .eq('user_id', caller.id)
      .single()

    if (callerProfile?.role !== 'admin') {
      return json({ error: 'Apenas administradores podem resetar senhas.' }, 403)
    }

    const { userId } = await req.json()
    if (!userId) return json({ error: 'userId é obrigatório.' }, 400)

    const novaSenha = crypto.randomUUID().slice(0, 12)
    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    const { error: updateError } = await adminClient.auth.admin.updateUserById(userId, {
      password: novaSenha,
    })

    if (updateError) return json({ error: updateError.message }, 400)

    return json({ senhaTemporaria: novaSenha })
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Erro inesperado.' }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
