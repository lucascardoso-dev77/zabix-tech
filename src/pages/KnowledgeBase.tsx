import { useEffect, useState } from 'react'
import { BookOpen } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { EmptyState } from '../components/EmptyState'
import { SkeletonCard } from '../components/LoadingState'
import type { KnowledgeBaseArticle } from '../types/database'

export default function KnowledgeBase() {
  const [articles, setArticles] = useState<KnowledgeBaseArticle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('knowledge_base')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setArticles((data as KnowledgeBaseArticle[]) ?? [])
        setLoading(false)
      })
  }, [])

  return (
    <div>
      <h1 className="text-xl font-bold text-navy-900">Base de Conhecimento</h1>
      <p className="mt-1 text-sm text-slate-500">Tire suas dúvidas e encontre soluções para problemas comuns.</p>

      {loading ? (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : articles.length === 0 ? (
        <div className="card-shadow mt-5 rounded-xl border border-slate-200 bg-white">
          <EmptyState
            icon={BookOpen}
            title="Nenhum artigo publicado ainda"
            description="Assim que a equipe publicar artigos, eles aparecem aqui."
          />
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <article key={a.id} className="card-shadow rounded-xl border border-slate-200 bg-white p-5">
              <span className="mb-3 inline-block rounded-md bg-brand-50 px-2 py-1 text-xs font-medium text-brand-600">
                {a.categoria ?? 'Geral'}
              </span>
              <h3 className="text-[15px] font-semibold text-navy-900">{a.titulo}</h3>
              <p className="mt-1.5 line-clamp-3 text-sm text-slate-500">{a.conteudo}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
