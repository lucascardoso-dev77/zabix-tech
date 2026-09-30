export type TicketStatus =
  | 'aberto'
  | 'em_analise'
  | 'em_atendimento'
  | 'aguardando_usuario'
  | 'aguardando_terceiro'
  | 'resolvido'
  | 'cancelado'

export type TicketPrioridade = 'baixa' | 'media' | 'alta' | 'critica'

export type AppRole = 'usuario' | 'tecnico' | 'admin'

export interface Profile {
  id: string
  user_id: string
  nome: string
  email: string
  cargo: string | null
  departamento: string | null
  avatar_url: string | null
  role: AppRole
  created_at: string
  updated_at: string
}

export interface TicketCategory {
  id: string
  nome: string
  descricao: string | null
}

export interface Ticket {
  id: string
  numero: string
  user_id: string
  titulo: string
  descricao: string | null
  categoria_id: string | null
  prioridade: TicketPrioridade
  status: TicketStatus
  tecnico_id: string | null
  created_at: string
  updated_at: string
  resolved_at: string | null
}

export interface TicketComment {
  id: string
  ticket_id: string
  user_id: string
  comentario: string
  created_at: string
}

export interface Purchase {
  id: string
  numero: string
  user_id: string
  descricao: string
  categoria: string | null
  status: string
  valor: number | null
  created_at: string
  updated_at: string
}

export interface InventoryItem {
  id: string
  codigo: string
  nome: string
  categoria: string | null
  quantidade: number
  estoque_minimo: number
  localizacao: string | null
  created_at: string
  updated_at: string
}

export interface Announcement {
  id: string
  titulo: string
  descricao: string
  data_publicacao: string
  ativo: boolean
  created_at: string
}

export interface AppNotification {
  id: string
  user_id: string
  titulo: string
  mensagem: string
  lida: boolean
  created_at: string
}

export interface Department {
  id: string
  nome: string
}

export interface KnowledgeBaseArticle {
  id: string
  titulo: string
  conteudo: string
  categoria: string | null
  autor_id: string | null
  created_at: string
  updated_at: string
}

// Tipo genérico simplificado — o Supabase CLI pode gerar um Database
// totalmente tipado a partir do schema com `supabase gen types typescript`.
export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> }
      ticket_categories: { Row: TicketCategory; Insert: Partial<TicketCategory>; Update: Partial<TicketCategory> }
      tickets: { Row: Ticket; Insert: Partial<Ticket>; Update: Partial<Ticket> }
      ticket_comments: { Row: TicketComment; Insert: Partial<TicketComment>; Update: Partial<TicketComment> }
      purchases: { Row: Purchase; Insert: Partial<Purchase>; Update: Partial<Purchase> }
      inventory: { Row: InventoryItem; Insert: Partial<InventoryItem>; Update: Partial<InventoryItem> }
      announcements: { Row: Announcement; Insert: Partial<Announcement>; Update: Partial<Announcement> }
      notifications: { Row: AppNotification; Insert: Partial<AppNotification>; Update: Partial<AppNotification> }
      departments: { Row: Department; Insert: Partial<Department>; Update: Partial<Department> }
      knowledge_base: { Row: KnowledgeBaseArticle; Insert: Partial<KnowledgeBaseArticle>; Update: Partial<KnowledgeBaseArticle> }
    }
  }
}
