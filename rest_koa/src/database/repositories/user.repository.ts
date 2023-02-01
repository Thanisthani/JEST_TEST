import userModel from '../models/user.model'
import {IUserInputs} from '../types/user.type'


export const  createUserRepo = async ({name,email,password} : IUserInputs)  =>{
        try {
            
            const user = new userModel({
                name,
                email,
                password
            })
             
            await user.save()
            return user

        } catch (error:any) {
            throw new Error(error.message)
          }
    }

 export const  findUserRepo =async (email : any)=>{
        try {
            const existingUser = await userModel.findOne({email : email})
            return existingUser
        } catch (error:any) {
            throw new Error(error.message)
          }
    }

export const findUserByTokenRepo = async (refreshToken : any)   =>{
    try {
        const existingUser = await userModel.findOne({refreshToken})
        return existingUser
    } catch (error:any) {
        throw new Error(error.message)
      }
} 

export const saveRefreshTokenRepo =async (userID: string , refreshToken :string) => {
    try {
        const user = await userModel.findById(userID).findOneAndUpdate({refreshToken:refreshToken})
        await user?.save();
    } catch (error:any) {
        throw new Error(error.message)
      }

    
}

export const  findUserByIdRepo = async (id : string) =>{
        try {
            const existingUser = await userModel.findById(id).select('-password').select('-refreshToken')
            return existingUser

        } catch (error:any) {
            throw new Error(error.message)
          }
    }

export const removeRefreshTokenRepo =async (refreshToken : string) => {
    try {
        const user = await findUserByTokenRepo(refreshToken)   
        if(user) {
            user.refreshToken = ''
            await user.save();
        }     
    } catch (error:any) {
        throw new Error(error.message)
      }
        
}