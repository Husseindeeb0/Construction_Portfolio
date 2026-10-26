import React, { useState, useEffect } from 'react'
import {
  useGetCompanyProfileQuery,
  useCreateCompanyProfileMutation,
  useUpdateCompanyProfileMutation,
} from '../../../../client/companyProfileAPI'
import { PageHeader } from '../../../components/common/PageHeader'
import { LoadingSpinner } from '../../../components/common/LoadingSpinner'
import { ErrorAlert } from '../../../components/common/ErrorAlert'
import { ImageUpload } from '../../../components/common/ImageUpload'
import { validateCompanyForm } from '../../../../validators/featureValidators'
import { formatErrorMessage } from '../../../lib/utils'
import { Building2, Save, CheckCircle } from 'lucide-react'

export const CompanyDashboard: React.FC = () => {
  const { data, isLoading, isError, error, refetch } = useGetCompanyProfileQuery()
  const [createCompany, { isLoading: isCreating }] = useCreateCompanyProfileMutation()
  const [updateCompany, { isLoading: isUpdating }] = useUpdateCompanyProfileMutation()

  const profile = data?.profile

  const [formData, setFormData] = useState({
    companyName: '',
    phoneNumber: '',
    email: '',
  })
  const [logoPayload, setLogoPayload] = useState<{ file: string; fileName: string } | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (profile) {
      setFormData({
        companyName: profile.companyName,
        phoneNumber: profile.phoneNumber,
        email: profile.email,
      })
    }
  }, [profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setSuccessMessage(null)

    const isCreate = !profile
    const errors = validateCompanyForm(
      {
        companyName: formData.companyName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        logo: logoPayload || undefined,
      },
      isCreate
    )

    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    try {
      if (isCreate) {
        if (!logoPayload) {
          setFieldErrors({ logo: 'Company logo is required' })
          return
        }
        await createCompany({
          companyName: formData.companyName,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          logo: logoPayload,
        }).unwrap()
        setSuccessMessage('Company profile created successfully')
      } else {
        await updateCompany({
          companyName: formData.companyName,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          logo: logoPayload || undefined,
        }).unwrap()
        setSuccessMessage('Company profile updated successfully')
      }
      setLogoPayload(null)
    } catch (err) {
      setFormError(formatErrorMessage(err))
    }
  }

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Loading company profile..." />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Company Profile"
        description="Manage your organization's core contact information and branding logo"
      />

      {isError && (
        <ErrorAlert
          message={formatErrorMessage(error)}
          onRetry={() => refetch()}
        />
      )}

      {formError && <ErrorAlert message={formError} />}

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 text-emerald-800 text-sm font-medium">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          {/* Company Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Company Name
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => {
                  setFormData({ ...formData, companyName: e.target.value })
                  if (fieldErrors.companyName) setFieldErrors({ ...fieldErrors, companyName: '' })
                }}
                placeholder="e.g. Acme Construction Ltd."
                className={`w-full pl-10 pr-4 py-2 bg-slate-50 border rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all ${
                  fieldErrors.companyName ? 'border-red-500' : 'border-slate-300'
                }`}
              />
            </div>
            {fieldErrors.companyName && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.companyName}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                required
                value={formData.phoneNumber}
                onChange={(e) => {
                  setFormData({ ...formData, phoneNumber: e.target.value })
                  if (fieldErrors.phoneNumber) setFieldErrors({ ...fieldErrors, phoneNumber: '' })
                }}
                placeholder="+1 (555) 000-0000"
                className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all ${
                  fieldErrors.phoneNumber ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {fieldErrors.phoneNumber && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.phoneNumber}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Official Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value })
                  if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' })
                }}
                placeholder="info@acmeconstruction.com"
                className={`w-full px-4 py-2 bg-slate-50 border rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all ${
                  fieldErrors.email ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {fieldErrors.email && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>
              )}
            </div>
          </div>

          {/* Logo Upload */}
          <div className="pt-2">
            <ImageUpload
              label="Company Logo"
              currentImageUrl={profile?.logoUrl}
              error={fieldErrors.logo}
              onChange={(payload) => {
                setLogoPayload(payload)
                if (fieldErrors.logo) setFieldErrors({ ...fieldErrors, logo: '' })
              }}
              helperText="Upload a high-resolution PNG or SVG logo for your portfolio header"
            />
          </div>

          <div className="pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={isCreating || isUpdating}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isCreating || isUpdating ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CompanyDashboard
