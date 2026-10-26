import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { Lock, Mail, HardHat, UserPlus, ArrowLeft } from 'lucide-react'
import { useSignupMutation } from '../../../client/authAPI'
import { validateSignupForm } from '../../../validators/featureValidators'
import { formatErrorMessage } from '../../lib/utils'
import { ErrorAlert } from '../../components/common/ErrorAlert'

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)

  const [signup, { isLoading }] = useSignupMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)

    const errors = validateSignupForm(formData)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    try {
      const response = await signup(formData).unwrap()
      if (response.user.role === 'ADMIN') {
        navigate('/dashboard/company', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } catch (err) {
      setServerError(formatErrorMessage(err))
    }
  }

  return (
    <div className="min-h-screen bg-[#0b1329] flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-[#131f38] border border-white/10 rounded-2xl shadow-2xl p-8 relative z-10 backdrop-blur-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-orange/15 border border-orange/30 rounded-2xl text-orange mb-4 shadow-inner">
            <HardHat className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Constructify
          </h1>
          <p className="text-xs text-white/60 mt-1.5 uppercase tracking-widest font-semibold">
            Create New Account
          </p>
        </div>

        {serverError && <ErrorAlert message={serverError} />}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value })
                  if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' })
                }}
                placeholder="user@example.com"
                className={`w-full pl-10 pr-4 py-2.5 bg-black/30 border rounded-xl text-sm text-white placeholder-white/30 focus:outline-hidden focus:ring-2 focus:ring-orange transition-all ${
                  fieldErrors.email ? 'border-red-500' : 'border-white/10'
                }`}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-xs text-red-400 mt-1.5 font-medium">
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value })
                  if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' })
                }}
                placeholder="••••••••••••"
                className={`w-full pl-10 pr-4 py-2.5 bg-black/30 border rounded-xl text-sm text-white placeholder-white/30 focus:outline-hidden focus:ring-2 focus:ring-orange transition-all ${
                  fieldErrors.password ? 'border-red-500' : 'border-white/10'
                }`}
              />
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-red-400 mt-1.5 font-medium">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-orange hover:bg-orange-dark text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-orange/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <span>Register Account</span>
                <UserPlus className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <Link
            to="/login"
            className="text-xs text-orange hover:text-white font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Already have an account? Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
