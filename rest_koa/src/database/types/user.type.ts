
export interface IUser  {
  id: string
  name: string
  email: string
  password: string
  refreshToken: string
}

export interface IUserInputs {
  name?:string,
  email:string,
  password:string
}
