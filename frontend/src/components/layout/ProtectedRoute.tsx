import React from 'react'
import { Navigate, Outlet } from 'react-router'
import { useGetMeQuery } from '../../../client/authAPI'
import { LoadingSpinner } from '../common/LoadingSpinner'

interface ProtectedRouteProps {
  allowedRoles?: ('ADMIN' | 'USER')[]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles = ['ADMIN'],
}) => {
  const { data, isLoading, isError } = useGetMeQuery()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <LoadingSpinner size="lg" text="Authenticating session..." />
      </div>
    )
  }

  if (isError || !data?.user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(data.user.role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
