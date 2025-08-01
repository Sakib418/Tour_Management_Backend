import { NextFunction, Request, Response } from "express";
import { User } from "./user.model";
import httpStatus from "http-status-codes";
import { UserService } from "./user.service";
import { catchAsync } from "../../Utils/catchAsync";
import { sendResponse } from "../../Utils/sendResponse";


const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserService.createUser(req.body);
    
  sendResponse(res,{
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User Created Successfully",
    data: user
  })    
})


const getAllUsers = catchAsync(async(req: Request, res: Response, next: NextFunction) =>{
   const result = await UserService.getAllUsers();
   sendResponse(res,{
    success: true,
    statusCode: httpStatus.CREATED,
    message: "All Users Retrived Successfully",
    data: result.data,
    meta: result.meta
  })
}

)


export const UserControllers = {
    createUser,
    getAllUsers
}