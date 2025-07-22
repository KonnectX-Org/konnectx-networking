import { Request, Response, NextFunction } from 'express';
import {verifyAccessToken} from "../utils/jwtUtils"
import AppError from '../utils/appError';
import { JwtPayload } from 'jsonwebtoken';
import { Roles } from '../modules/organization/types/organizationEnums';

interface TokenPayload {
  id: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: any;
      admin?: JwtPayload;
      organization?: any;
    }
  }
}


export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const token =
    req.cookies["accessToken"]

  if (!token) {
    return next(new AppError("Token must be provided", 401));
  }

  try {
    const payload: TokenPayload | null = verifyAccessToken(token);

    if(payload && payload.role === Roles.ORGANIZATION)
    {
      req.organization = payload
      return next();
    }
    else if(payload && payload.role === Roles.USER) {
      req.user = payload
      return next();
    }
    else {
      return next(new AppError("Unauthorized: Invalid token", 401));
    }
  } catch (err) {
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};
