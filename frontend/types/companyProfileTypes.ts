import type { ImageUploadPayload } from './commonTypes'

export interface CompanyProfile {
  id: number
  companyName: string
  logoUrl: string
  phoneNumber: string
  email: string
  createdAt: string
  updatedAt: string
}

export interface CompanyProfileResponse {
  profile: CompanyProfile | null
}

export interface CreateCompanyRequest {
  companyName: string
  phoneNumber: string
  email: string
  logo: ImageUploadPayload
}

export interface UpdateCompanyRequest {
  companyName?: string
  phoneNumber?: string
  email?: string
  logo?: ImageUploadPayload
}
