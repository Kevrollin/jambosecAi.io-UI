import { Route, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'
import { paths } from '../../routes/paths'
import { AccountOverviewPage } from '../../features/accounts/pages/AccountOverviewPage'
import  ChatPage  from '../../features/chat/pages/ChatPage'
import { KnowledgeHubPage } from '../../features/knowledge/pages/KnowledgeHubPage'
import { GuideDetailPage } from '../../features/knowledge/pages/GuideDetailPage'
import {PrivacyPolicyPage} from '../../features/policy/pages/PrivacyPolicyPage'
import HomePage from '../../features/core/pages/HomePage'
import { NotFoundPage } from '../../features/core/pages/NotFoundPage'
import { MainLayout } from '../layout/MainLayout'
import { RequireAuth } from '../../features/accounts/components/RequireAuth'
import { RedirectIfAuthenticated } from '../../features/accounts/components/RedirectIfAuthenticated'

// Auth pages (default exports)
import LoginPage from '../../pages/loginPage'
import SignupPage from '../../pages/signUpPage'

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Public landing page */}
      <Route path={paths.root} element={<HomePage />} />

      {/* Auth pages - redirect if already authenticated */}
      <Route 
        path={paths.auth.login} 
        element={
          <RedirectIfAuthenticated>
            <LoginPage />
          </RedirectIfAuthenticated>
        } 
      />
      <Route 
        path={paths.auth.signup} 
        element={
          <RedirectIfAuthenticated>
            <SignupPage />
          </RedirectIfAuthenticated>
        } 
      />

      {/* Knowledge Hub - Public (no auth required) */}
      <Route element={<MainLayout />}>
        <Route element={<KnowledgeHubPage />} path={paths.knowledge.root} />
        <Route element={<GuideDetailPage />} path="/knowledge/guide/:slug" />
      </Route>

      {/* Protected core pages require authentication - wrapped with MainLayout (shows GlobalNavigation) */}
      <Route element={<RequireAuth><MainLayout /></RequireAuth>}>
        <Route element={<AccountOverviewPage />} path={paths.accounts.root} />
        <Route element={<ChatPage />} path={paths.chat.root} />
        <Route element={<PrivacyPolicyPage />} path={paths.policy.privacy} />
      </Route>

      {/* Catch-all route for 404s */}
      <Route path="*" element={<NotFoundPage />} />
    </>,
  ),
)