
// This code extends the Request type to add user, admin, and organization properties.
import { JwtPayload } from "jsonwebtoken";  // Assuming you have JwtPayload defined elsewhere

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;  // You can replace `JwtPayload` with the actual type if different
      admin?:JwtPayload;
      organization?:JwtPayload;
    }
  }
}

// declare global: Tells TypeScript that you’re adding new types globally, so you don’t have to import them in every file