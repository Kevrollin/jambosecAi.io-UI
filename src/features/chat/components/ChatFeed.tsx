import { ChatMessage } from '../types'

const roleLabels: Record<ChatMessage['role'], string> = {
  user: 'You',
  assistant: 'Assistant',
  system: 'System',
}

export type ChatFeedProps = {
  messages: ChatMessage[]
}

export const ChatFeed = ({ messages }: ChatFeedProps) => {
  if (messages.length === 0) {
    return <p className="text-sm text-slate-500">No messages yet.</p>
  }

  return (
    <ul className="space-y-4">
      {messages.map((message) => (
        <li
          key={message.id}
          className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${
            message.role === 'assistant' ? 'border-indigo-200 bg-indigo-50' : ''
          }`}
        >
          <header className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-500">
            <strong className="text-slate-600">{roleLabels[message.role]}</strong>
            <time dateTime={message.createdAt}>{new Date(message.createdAt).toLocaleTimeString()}</time>
          </header>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{message.content}</p>
        </li>
      ))}
    </ul>
  )
}
