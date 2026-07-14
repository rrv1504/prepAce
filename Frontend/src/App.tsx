import { useState } from 'react'
import type { ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import AppLayout from './components/AppLayout'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import DSATracker from './pages/DSATracker'
import CodingPractice from './pages/CodingPractice'
import AptitudeModule from './pages/AptitudeModule'
import Analytics from './pages/Analytics'
import CompanyPrep from './pages/CompanyPrep'
import StudyPlanner from './pages/StudyPlanner'
import InterviewExperience from './pages/InterviewExperience'
import Profile from './pages/Profile'
import Notifications from './pages/Notifications'
import MockTest from './pages/MockTest'
import TryCodingIDE from './pages/TryCodingIDE'
import CompanyVisits from './pages/CompanyVisits'
import Resources from './pages/Resources'

// Admin
import AdminLogin from './admin/AdminLogin'
import AdminLayout from './admin/AdminLayout'
import AdminGuard from './admin/AdminGuard'
import AdminDashboardPage from './admin/pages/AdminDashboardPage'
import AdminCompanyPage from './admin/pages/AdminCompanyPage'
import AdminDSAPage from './admin/pages/AdminDSAPage'
import AdminAptitudePage from './admin/pages/AdminAptitudePage'
import AdminMockTestPage from './admin/pages/AdminMockTestPage'
import AdminBadgePage from './admin/pages/AdminBadgePage'
import AdminLeaderboardPage from './admin/pages/AdminLeaderboardPage'
import AdminRoadmapPage from './admin/pages/AdminRoadmapPage'
import AdminJudgePage from './admin/pages/AdminJudgePage'
import AdminUsersPage from './admin/pages/AdminUsersPage'
import AdminResourcePage from './admin/pages/AdminResourcePage'

export type Theme = 'dark' | 'light'

function hasStudentSession() {
  return Boolean(localStorage.getItem('prepace_token'))
}

function hasAdminSession() {
  return sessionStorage.getItem('admin_auth') === 'true' && Boolean(localStorage.getItem('adminToken'))
}

function RootEntry({ theme, toggleTheme }: { theme: Theme; toggleTheme: () => void }) {
  if (hasAdminSession()) return <Navigate to="/admin/dashboard" replace />
  if (hasStudentSession()) return <Navigate to="/app/dashboard" replace />
  return <LandingPage theme={theme} toggleTheme={toggleTheme} />
}

function UserGuard({ children }: { children: ReactNode }) {
  if (!hasStudentSession()) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const [theme, setTheme] = useState<Theme>('dark')
  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'))

  return (
    <AppProvider>
      <div className={theme}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootEntry theme={theme} toggleTheme={toggleTheme} />} />
            <Route path="/auth/:mode?" element={<AuthPage theme={theme} />} />
            <Route path="/try-ide" element={<TryCodingIDE />} />

            {/* DSA Tracker is full-page (no sidebar) */}
            <Route path="/app/dsa" element={<UserGuard><DSATracker theme={theme} toggleTheme={toggleTheme} /></UserGuard>} />

            <Route path="/app" element={<UserGuard><AppLayout theme={theme} toggleTheme={toggleTheme} /></UserGuard>}>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="coding" element={<CodingPractice />} />
              <Route path="aptitude" element={<AptitudeModule />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="companies" element={<CompanyPrep />} />
              <Route path="planner" element={<StudyPlanner />} />
              <Route path="interviews" element={<InterviewExperience />} />
              <Route path="profile" element={<Profile />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="mocktest" element={<MockTest />} />
              <Route path="visits" element={<CompanyVisits />} />
              <Route path="resources" element={<Resources />} />
              <Route path="quiz" element={<Navigate to="/app/mocktest" replace />} />
            </Route>

            {/* Admin routes — completely separate from user app */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="companies" element={<AdminCompanyPage />} />
              <Route path="dsa" element={<AdminDSAPage />} />
              <Route path="aptitude" element={<AdminAptitudePage />} />
              <Route path="mocktests" element={<AdminMockTestPage />} />
              <Route path="badges" element={<AdminBadgePage />} />
              <Route path="leaderboard" element={<AdminLeaderboardPage />} />
              <Route path="roadmaps" element={<AdminRoadmapPage />} />
              <Route path="judge" element={<AdminJudgePage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="resources" element={<AdminResourcePage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </div>
    </AppProvider>
  )
}
