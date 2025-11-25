import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";

/**
 * The expected shape of the JWT payload.
 * This represents the information stored inside the token.
 */
interface JWTPayload {
	id: number;
	username: string;
}

/**
 * Extend Express' built-in Request type
 * so we can safely attach `req.user` after verifying the JWT.
 */
declare module "express-serve-static-core" {
	interface Request {
		/**
		 * The decoded JWT payload containing user information.
		 * Added by the `auth` middleware.
		 */
		user?: JWTPayload;
	}
}

/**
 * Authentication middleware function for protecting routes.
 *
 * How it works:
 * 1. Checks for Authorization header: `Authorization: Bearer <token>`
 * 2. Extracts the token
 * 3. Verifies the token using the secret
 * 4. If valid → attaches decoded user payload to `req.user`
 * 5. If invalid → sends 401 "Invalid token"
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Callback to pass control to the next middleware/handler
 */
export function auth(req: Request, res: Response, next: NextFunction) {
	const authHeader = req.headers.authorization;

	// Ensure the header exists
	if (!authHeader) {
		return res.status(401).json({ error: "No token provided" });
	}

	// Extract the token part from "Bearer <token>"
	const token = authHeader.split(" ")[1];

	try {
		// Verify the token and decode its payload
		const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
		// Attach the decoded payload to req.user
		req.user = decoded;
		// Continue request
		next();
	} catch (err) {
		// Token invalid or expired
		return res.status(401).json({ error: "Invalid token" });
	}
}