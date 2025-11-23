import dotenv from "dotenv";
// Load environment variables from .env file
dotenv.config();

// Ensure JWT_SECRET is set
if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in .env, please set it!");
}

// Export all global config values
export const JWT_SECRET = process.env.JWT_SECRET;