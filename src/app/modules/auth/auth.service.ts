import AppError from "../../errorHandlers/AppError";
import { IsActive, IUser } from "../user/user.interface";
import httpStatus from "http-status-codes";
import { User } from "../user/user.model";
import bcryptjs from "bcryptjs";

import { generateToken, verifyToken } from "../../Utils/jwt";
import { envVars } from "../../config/env";
import { createNewAccessTokenWithRefreshToken, createUserTokens } from "../../Utils/userTokens";
import { JwtPayload } from "jsonwebtoken";
import { string } from "zod";

const credentialsLogin = async (payload: Partial<IUser>) => {
    const {email,password} = payload;

    const isUserExist = await User.findOne({email})
    console.log(isUserExist);
    if(!isUserExist){
        throw new AppError(httpStatus.BAD_REQUEST, "Email does not exist")
    }
    const isPasswordMatched = await bcryptjs.compare(password as string , isUserExist.password as string)
    
    if(!isPasswordMatched)
    {
        throw new AppError(httpStatus.BAD_REQUEST, "Incorrect Password")
    }
    
    // const jwtPayload = {
    //     userId: isUserExist._id,
    //     email: isUserExist.email,
    //     role: isUserExist.role
    // }
     
    // const accessToken = generateToken(jwtPayload,envVars.JWT_ACCESS_SECRET
    //     ,envVars.JWT_ACCESS_EXPIRES);

    //  const refreshToken = generateToken(jwtPayload,envVars.JWT_REFRESH_SECRET,
    //     envVars.JWT_REFRESH_EXPIRES)
      
       const userToken = createUserTokens(isUserExist);
        
        const {password: pass,...rest} = isUserExist.toObject();


    // const accessToken = jwt.sign(jwtPayload,"secret",{
    //     expiresIn: "1d"
    // })

    return{
        accessToken : userToken.accessToken,
        refreshToken : userToken.refreshToken,
        user: rest
    }
}


const getNewAccessToken = async (refreshToken : string) => {
    
     const newAccessToken = await createNewAccessTokenWithRefreshToken(refreshToken)

     return{
        accessToken :newAccessToken
        
    }
}

const resetPassword = async (decodedToken : JwtPayload,newPassword: string,oldPassword: string) => {
    
     const user = await User.findById(decodedToken.userId);

     const isOldPasswordMatch = await bcryptjs.compare(oldPassword, user!.password as string);
     
      if(!isOldPasswordMatch){
        throw new AppError(httpStatus.UNAUTHORIZED, "Old Password does not mathc");
      }
      user!.password = await bcryptjs.hash(newPassword, Number(envVars.BCRYPT_SALT_ROUND));
      
      user?.save();

}


export const AuthService = {
    credentialsLogin,
    getNewAccessToken,
    resetPassword
}
