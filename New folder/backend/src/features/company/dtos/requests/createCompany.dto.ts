export interface CreateCompanyRequestDto {
  companyName: string
  phoneNumber: string
  email: string
  logo: {
    file: string
    fileName: string
  }
}
