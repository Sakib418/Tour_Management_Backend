import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../Utils/catchAsync";
import { UserService } from "../user/user.service";
import { sendResponse } from "../../Utils/sendResponse";
import httpStatus from "http-status-codes";
import { AuthService } from "./auth.service";
import AppError from "../../errorHandlers/AppError";
import { setAuthCookie } from "../../Utils/setCookie";
import { User } from "../user/user.model";
import { JwtPayload } from "jsonwebtoken";
import { createUserTokens } from "../../Utils/userTokens";
import { envVars } from "../../config/env";
import passport from "passport"

const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
   
  //General custom login start
  //   const loginInfo = await AuthService.credentialsLogin(req.body)
    
  //   //  res.cookie("accessToken", loginInfo.accessToken,{
  //   //   httpOnly: true,
  //   //   secure: false,
  //   // })

  //   // res.cookie("refreshToken", loginInfo.refreshToken,{
  //   //   httpOnly: true,
  //   //   secure: false,
  //   // })


  // setAuthCookie(res,loginInfo);
  // sendResponse(res,{
  //   success: true,
  //   statusCode: httpStatus.CREATED,
  //   message: "User Created Successfully",
  //   data: loginInfo
  // })  
    //General custom login end
    
    passport.authenticate("local", async (err: any, user: any, info: any) => {

        if (err) {

            // ❌❌❌❌❌
            // throw new AppError(401, "Some error")
            // next(err)
            // return new AppError(401, err)


            // ✅✅✅✅
            // return next(err)
            // console.log("from err");
            return next(new AppError(401, err))
        }

        if (!user) {
            // console.log("from !user");
            // return new AppError(401, info.message)
            return next(new AppError(401, info.message))
        }

        const userTokens = await createUserTokens(user)

        // delete user.toObject().password

        const { password: pass, ...rest } = user.toObject()


        setAuthCookie(res, userTokens)

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "User Logged In Successfully",
            data: {
                accessToken: userTokens.accessToken,
                refreshToken: userTokens.refreshToken,
                user: rest

            },
        })
    })(req, res, next)
})

const getNewAccessToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
   
    const refreshToken = req.cookies.refreshToken;

    if(!refreshToken){
      throw new AppError(httpStatus.BAD_REQUEST, "No refresh token recieved from cookies");
    }

    const tokenInfo = await AuthService.getNewAccessToken(refreshToken as string)
    
    //  res.cookie("accessToken", tokenInfo.accessToken,{
    //   httpOnly: true,
    //   secure: false,
    // })
  setAuthCookie(res,tokenInfo.accessToken)



  sendResponse(res,{
    success: true,
    statusCode: httpStatus.CREATED,
    message: "New access token retrive Successfully",
    data: tokenInfo
  })    
})


const logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
   
    res.clearCookie("accessToken",{
      httpOnly: true,
      secure: false,
      sameSite: "lax"
    })
     res.clearCookie("refreshToken",{
      httpOnly: true,
      secure: false,
      sameSite: "lax"
    })

  sendResponse(res,{
    success: true,
    statusCode: httpStatus.OK,
    message: "User Loged out Successfully",
    data: null
  })    
})


const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
   
    const newPassword = req.body.newPassword;
    const oldPassword = req.body.oldPassword;
    const decodedToken = req.user;
    await AuthService.resetPassword(decodedToken as JwtPayload,newPassword,oldPassword); 

  sendResponse(res,{
    success: true,
    statusCode: httpStatus.OK,
    message: "Password changed Successfully",
    data: null
  })    
})
const googleCallBackController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
   
  let redirectTo = req.query.state ? req.query.state as string : "" 
   
  if(redirectTo.startsWith("/")){
   redirectTo = redirectTo.slice(1)
  }
  const user = req.user;
  
  console.log(user); 

  if(!user){
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found")
  }

  const tokenInfo = createUserTokens(user);

  setAuthCookie(res, tokenInfo);

  res.redirect(`${envVars.FRONEND_URL}/${redirectTo}`)  
})

export const AuthController = {
    credentialsLogin,
    getNewAccessToken,
    logout,
    resetPassword,
    googleCallBackController
}
