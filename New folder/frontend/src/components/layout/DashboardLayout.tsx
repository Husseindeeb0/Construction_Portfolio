import React, { useState } from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router'
import {
  Building2,
  Sparkles,
  Info,
  Wrench,
  Award,
  FolderGit2,
  Layers,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Home,
} from 'lucide-react'
import { useGetMeQuery, useSignoutMutation } from '../../../client/authAPI'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { name: 'Company Profile', href: '/dashboard/company', icon: Building2 },
  { name: 'Hero Section', href: '/dashboard/hero', icon: Sparkles },
  { name: 'About Us', href: '/dashboard/about', icon: Info },
  { name: 'Services', href: '/dashboard/services', icon: Wrench },
  { name: 'Track Record', href: '/dashboard/records', icon: Award },
  { name: 'Projects', href: '/dashboard/projects', icon: FolderGit2 },
  { name: 'Project Categories', href: '/dashboard/categories', icon: Layers },
]

export const DashboardLayout: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { data: meData } = useGetMeQuery()
  const user = meData?.user
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [signoutApi, { isLoading: isSigningOut }] = useSignoutMutation()

  const handleLogout = async () => {
    try {
      await signoutApi().unwrap()
    } catch (err) {
      console.warn('Signout backend call finished or errored:', err)
    } finally {
      navigate('/login')
    }
  }

  return (
    <div className="h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0b1329] text-white border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange flex items-center justify-center font-bold text-white shadow-sm">
            C
          </div>
          <span className="font-semibold text-sm tracking-wide">Constructify Admin</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0b1329] text-white/80 flex flex-col border-r border-white/10 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:h-screen md:shrink-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="hidden md:flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-orange flex items-center justify-center font-black text-white shadow-md">
            C
          </div>
          <div>
            <h2 className="font-bold text-sm text-white tracking-wide leading-tight">
              Constructify
            </h2>
            <p className="text-[11px] text-orange font-semibold tracking-wider uppercase">
              Portfolio Admin
            </p>
          </div>
        </div>

        {/* User Badge */}
        <div className="px-6 py-4 border-b border-white/10 bg-black/20">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-orange">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">
                {user?.email || 'admin@constructify.com'}
              </p>
              <p className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider">
                {user?.role || 'Administrator'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  isActive
                    ? 'bg-orange text-white shadow-sm font-bold'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-white/60'
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Home & Logout */}
        <div className="p-3 border-t border-white/10 space-y-1">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4 text-orange" />
            <span>Go to Home Page</span>
          </Link>

          <button
            onClick={handleLogout}
            disabled={isSigningOut}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            <span>{isSigningOut ? 'Logging out...' : 'Sign Out'}</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
