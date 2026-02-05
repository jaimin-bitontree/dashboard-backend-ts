import { NextFunction,Request,Response } from "express";
import { signupSchema } from "../utils/validation.schema";
export const validateSignup = (req:Request, res:Response, next:NextFunction) => {
  const result = signupSchema.safeParse(req.body);
  console.log(result);

  if (!result.success) {
    console.log(result);
    return res.status(400).json({
      error: result.error.issues[0].message,
    });
  }
  next();
};