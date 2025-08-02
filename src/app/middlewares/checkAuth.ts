import { NextFunction, Request, Response } from "express";
import AppError from "../errorHandlers/AppError";
import { verifyToken } from "../Utils/jwt";
import { envVars } from "../config/env";
import jwt, { JwtPayload } from "jsonwebtoken";

export const checkAuth = (...authRoles: string[]) => async (req: Request, res: Response, next: NextFunction) => {
try {
        const accessToken = req.headers.authorization;
        if(!accessToken){
            throw new AppError(403, "No Token Received");
        }

       const verifiedToken  = verifyToken(accessToken,envVars.JWT_ACCESS_SECRET) as JwtPayload
       
       if(!authRoles.includes(verifiedToken.role)){
        throw new AppError(403, "You are not permitted to view this route!!");
       }
        req.user = verifiedToken
       next();

    } catch (error) {
        next(error);
    }
}