import jwt from "jsonwebtoken";

export interface JWTPayload {
  id: string;
  role: "ADMIN" | "USER";
  email: string;
}

/**
 * Verify JWT token from Request headers
 */
export function verifyJWT(req: Request): JWTPayload | null {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return null;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET environment variable is missing.");
      return null;
    }

    const decoded = jwt.verify(token, secret) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return null;
  }
}
