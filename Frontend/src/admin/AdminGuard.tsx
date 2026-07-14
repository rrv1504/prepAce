import { Navigate } from 'react-router-dom'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const isAuth = sessionStorage.getItem('admin_auth') === 'true' && Boolean(localStorage.getItem('adminToken'))
  if (!isAuth) return <Navigate to="/admin" replace />
  return <>{children}</>
}
