import { NextFunction, Request, Response } from "express"
import {  ZodObject, ZodRawShape } from "zod"

export const validateRequest = (schema: ZodObject<ZodRawShape>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
