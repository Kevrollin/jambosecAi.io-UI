import { FormEvent, useState } from 'react'

export type ChatInputProps = {
  onSubmit: (message: string) => Promise<void> | void
  disabled?: boolean
}

export const ChatInput = ({ onSubmit, disabled = false }: ChatInputProps) => {
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!message.trim()) {
      return
    }

    setPending(true)

    try {
      await onSubmit(message.trim())
      setMessage('')
    } finally {
      setPending(false)
    }
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="chat-message">
        Send a message
      </label>
      <textarea
        id="chat-message"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Ask anything about your knowledge base"
        rows={3}
        disabled={disabled || pending}
        className="w-full resize-none rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={disabled || pending}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {pending ? 'Sending…' : 'Send'}
      </button>
    </form>
  )
}
