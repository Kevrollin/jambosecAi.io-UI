import { PropsWithChildren } from 'react'

export const PageContainer = ({ children }: PropsWithChildren) => {
  return <div className="mx-auto w-full max-w-5xl px-6">{children}</div>
}
