import { Account } from '../types'

export type AccountProfileCardProps = {
  account: Account
}

export const AccountProfileCard = ({ account }: AccountProfileCardProps) => {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">{account.displayName}</h2>
      <dl className="mt-4 space-y-3 text-sm text-slate-600">
        <div className="flex items-center justify-between">
          <dt className="font-medium">Username</dt>
          <dd>{account.username}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="font-medium">Email</dt>
          <dd>{account.email}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="font-medium">Joined</dt>
          <dd>{new Date(account.joinedAt).toLocaleString()}</dd>
        </div>
      </dl>
    </article>
  )
}
