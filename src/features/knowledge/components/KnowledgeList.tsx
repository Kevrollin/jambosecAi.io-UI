import { KnowledgeDocument, KnowledgeSource } from '../types'

export type KnowledgeListProps = {
  sources: KnowledgeSource[]
  documents: KnowledgeDocument[]
}

export const KnowledgeList = ({ sources, documents }: KnowledgeListProps) => {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Sources</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          {sources.map((source) => (
            <li key={source.id} className="flex items-center justify-between">
              <strong className="font-medium text-slate-700">{source.name}</strong>
              <span className="text-xs uppercase tracking-wide text-slate-400">
                {source.type}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Documents</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          {documents.map((document) => (
            <li key={document.id} className="flex items-center justify-between">
              <strong className="font-medium text-slate-700">{document.title}</strong>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                {document.status}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
