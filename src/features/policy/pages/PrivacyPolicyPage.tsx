import React from 'react';
import { Link } from 'react-router-dom';
import { useAsyncValue } from '../../../hooks/useAsyncValue';
import { fetchPrivacyPolicy } from '../services/policyService';

export const PrivacyPolicyPage = () => {
  const policyState = useAsyncValue(fetchPrivacyPolicy);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto max-w-3xl px-4 py-16 space-y-10">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="text-gray-600">
            Understand how your data is processed and stored.
          </p>
        </header>

        {policyState.status === 'loading' && (
          <p className="text-gray-500">Loading policy…</p>
        )}

        {policyState.status === 'error' && (
          <div
            role="alert"
            className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700"
          >
            <p className="font-medium">Unable to fetch the latest policy.</p>
            <button
              className="mt-2 text-sm underline"
              onClick={() => void policyState.reload()}
            >
              Retry
            </button>
          </div>
        )}

        {policyState.data ? (
          <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-400">
              Last updated:{' '}
              {new Date(policyState.data.updatedAt).toLocaleDateString()}
            </p>
            <div className="prose prose-lg mt-4 text-gray-700">
              {policyState.data.content}
            </div>
          </article>
        ) : (
          policyState.status !== 'loading' &&
          policyState.status !== 'error' && (
            <div className="prose prose-lg text-gray-700">
              <p>
                Welcome to JamboSec. Your privacy is critically important to us.
              </p>

              <p>
                This is a placeholder for your Privacy Policy. It explains how
                user data is handled, what is collected, and how it’s protected.
              </p>

              <h2 className="mt-8">Our Core Privacy Commitment</h2>
              <ul>
                <li>
                  <strong>No Chat History Storage:</strong> We do not save, log,
                  or store the contents of your conversations. All data is
                  session-only.
                </li>
                <li>
                  <strong>Minimal Data Collection:</strong> Only essential
                  details (like email for login) are collected.
                </li>
                <li>
                  <strong>Data Protection Act (DPA 2019):</strong> We comply
                  with Kenya’s DPA 2019 standards.
                </li>
              </ul>

              <p className="mt-8">
                [... Full legal text for the Privacy Policy will go here ...]
              </p>
            </div>
          )
        )}

        <div>
          <Link
            to="/"
            className="inline-block text-blue-800 hover:underline mt-8"
          >
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};
