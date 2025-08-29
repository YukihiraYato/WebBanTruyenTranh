export interface UserLoginResponseDTO {
  code: number
  result: string
  message: string
}

export interface UserDetailsResponseDTO {
 code: number,
 result: UserDetails,
 message: string
}
export interface UserDetails {
  userId: number
  fullName: string
  gender: string
  phoneNum: string
  verified: boolean
  email: string
  username: string
  dateOfBirth: string
  // createdDate: string
  // defaultAddress: string
}
