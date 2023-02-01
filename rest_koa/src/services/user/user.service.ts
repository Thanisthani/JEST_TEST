import  {findUserRepo,createUserRepo, findUserByIdRepo ,findUserByTokenRepo , saveRefreshTokenRepo, removeRefreshTokenRepo} from '../../database/repositories/user.repository'
import { IUser } from '../../database/types/user.type'
import { generatePassword, generateRefreshToken, generateToken, validatePassword } from '../../utils'

export interface RegisterInputs {
    name:string,
    email:string,
    password:string
  }
  
  export interface LoginInputs {    
    email:string,
    password:string
  }

export const registerUserService = async (userInputs: RegisterInputs) => {
    const { name,email, password} = userInputs
    try {
        
         const checkExistingUser : any= await findUserRepo(email)
      

        if(!checkExistingUser){ 
            
            
            let hashedPassword = await generatePassword(password)

            const newUser : any = await createUserRepo({name,email,password:hashedPassword})
            
            const accessToken = await generateToken({email: newUser.email, id: newUser.id})

            const refreshToken = await generateRefreshToken({name: newUser.name,id:newUser.id})

            await saveRefreshTokenRepo(newUser.id,refreshToken)
            
            return { accessToken,refreshToken}

        } else {
            throw new Error("Email Already Registered")
        }
        
    } catch (error:any) {
        throw new Error(error.message)
    }
}

export const loginUserService = async (userInputs : LoginInputs) =>{

    const {email,password} = userInputs

    try {
        const existingUser :any = await findUserRepo(email)

        if (existingUser) {
            
            const  validatedPassword = await validatePassword(password, existingUser.password)
            

            if(validatedPassword){
                    const accessToken = await generateToken({email : existingUser.email, id:existingUser.id})   
                    const refreshToken = await generateRefreshToken({name:existingUser.name ,id:existingUser.id })

                    await saveRefreshTokenRepo(existingUser.id,refreshToken)

                    return { accessToken,refreshToken }
            }else {
                throw new Error("Incorrect Password")
            }
        }else {
            throw new Error("User not found")
        }
    } catch (error: any) {
        console.log(error);
        throw new Error(error.message)
    }
}

export const logoutUserService =async (refreshToken : string) => {
    try {
        await removeRefreshTokenRepo(refreshToken)
    } catch (error:any) {
        throw new Error
    }
    
}

export const RefreshTokenService = async (refreshToken:string) => {
    try {
        const user  = await findUserByTokenRepo(refreshToken)
        return user
    } catch (error:any) {
        throw new Error(error.message)
    }
}

export const userFindByIDService = async (userID : IUser['id']) => {
    try {
        const user = await findUserByIdRepo(userID)
        return user
    } catch (error:any) {
        throw new Error(error.message)
    }
}    

