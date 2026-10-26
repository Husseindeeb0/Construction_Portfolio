export interface UpdateCompanyRequestDto {
  companyName?: string
  phoneNumber?: string
  email?: string
  logo?: {
    file: string
    fileName: string
  }
}
