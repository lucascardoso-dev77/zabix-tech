// Supabase Edge Function: admin-create-user
//
// Cria um novo usuário (Auth + profile) com privilégio de administrador.
// A service_role key NUNCA fica no frontend — ela só existe aqui, no ambiente
// do servidor da função, como variável de ambiente configurada pelo Supabase.
//
// Deploy:
//   supabase functions deploy admin-create-user
//
// Chamada pelo frontend (usuário já autenticado como admin):
//   supabase.functions.invoke('admin-create-user', { body: { email, nome, cargo, role } })

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
    if (!authHeader) {
      return json({ error: 'Não autenticado.' }, 401)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Cliente "de leitura", autenticado como quem chamou a função —
    // usado só para confirmar que quem está pedindo é de fato um admin.
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const {
      data: { user: caller },
      error: callerError,
    } = await callerClient.auth.getUser()

    if (callerError || !caller) {
      return json({ error: 'Sessão inválida.' }, 401)
    }

    const { data: callerProfile } = await callerClient
      .from('profiles')
      .select('role')
      .eq('user_id', caller.id)
      .single()

    if (callerProfile?.role !== 'admin') {
      return json({ error: 'Apenas administradores podem criar usuários.' }, 403)
    }

    const { email, nome, cargo, departamento, role, senhaTemporaria } = await req.json()

    if (!email || !nome) {
      return json({ error: 'E-mail e nome são obrigatórios.' }, 400)
    }

    const password: string = senhaTemporaria || crypto.randomUUID().slice(0, 12)

    // Cliente com service_role: só este cliente pode criar usuários via Admin API.
    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nome, cargo: cargo ?? 'Colaborador' },
    })

    if (createError || !created.user) {
      return json({ error: createError?.message ?? 'Falha ao criar usuário.' }, 400)
    }

    // O trigger on_auth_user_created já cria o profile automaticamente;
    // aqui só garantimos que os campos extras (cargo, departamento, role) fiquem corretos.
    await adminClient
      .from('profiles')
      .update({
        nome,
        cargo: cargo ?? 'Colaborador',
        departamento: departamento ?? null,
        role: role ?? 'usuario',
      })
      .eq('user_id', created.user.id)

    return json({
      user_id: created.user.id,
      email,
      senhaTemporaria: senhaTemporaria ? undefined : password,
    })
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
