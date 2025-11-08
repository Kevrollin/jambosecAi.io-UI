import { useCallback } from 'react'
import { useAsyncValue } from '../../../hooks/useAsyncValue'
import { KnowledgeList } from '../components/KnowledgeList'
import {
  listKnowledgeDocuments,
  listKnowledgeSources,
} from '../services/knowledgeService'

export const KnowledgeBasePage = () => {
  const loadKnowledgeBase = useCallback(async () => {
    const [sources, documents] = await Promise.all([
      listKnowledgeSources(),
      listKnowledgeDocuments(),
    ])

    return { sources, documents }
  }, [])

  const dataState = useAsyncValue(loadKnowledgeBase)

  const sources = dataState.data?.sources ?? []
  const documents = dataState.data?.documents ?? []

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">Knowledge</h1>
        <p className="text-slate-600">Manage documents, embeddings, and ingestion pipelines.</p>
      </header>

      {dataState.status === 'loading' && <p className="text-slate-500">Loading knowledge base…</p>}

      {dataState.status === 'error' && (
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700"
        >
          <p className="font-medium">Unable to load knowledge data.</p>
          <button className="mt-2 text-sm underline" onClick={() => void dataState.reload()}>
            Retry
          </button>
        </div>
      )}

      <KnowledgeList documents={documents} sources={sources} />
    </section>
  )
}
