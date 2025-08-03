import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../types";
import jwt from "jsonwebtoken";
import { TokenPayload } from "../types";
import cloudinary from "../config/cloudinary";
import fs from "fs/promises";

const validateTokenMiddleware = (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        error: "Access denied. No token provided.",
      });
    }
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      return res.status(500).json({
        error: "Jwt secret not defined",
      });
    }
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return res.status(401).json({
        error: "Token has expired",
      });
    }
    if (!decoded.schoolId || !decoded.schoolName) {
      return res.status(401).json({
        error: "Invalid token: missing required school information",
      });
    }

    // Attach user info to request
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: "Invalid token",
      });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: "Token has expired",
      });
    }

    console.error("Token validation error:", error);
    return res.status(500).json({
      error: "Internal server error during token validation",
    });
  }
};

/**
 * Middleware to validate school headers and match with token
 */
const validateSchoolHeadersMiddleware = (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const headerSchoolId = req.headers["x-school-id"] as string | undefined;
    const headerBranchId = req.headers["x-branch-id"] as string | undefined;

    // Validate required header
    if (!headerSchoolId) {
      return res.status(400).json({
        error: "X-SCHOOL-ID header is required",
      });
    }

    // Ensure user info is available from token validation
    if (!req.user) {
      return res.status(401).json({
        error: "User authentication required",
      });
    }

    // Validate school ID matches token
    if (headerSchoolId !== req.user.schoolId) {
      return res.status(403).json({
        error: "School ID in header does not match token",
      });
    }

    // Validate branch ID if provided in both header and token
    if (headerBranchId && req.user.branchId) {
      if (headerBranchId !== req.user.branchId) {
        return res.status(403).json({
          error: "Branch ID in header does not match token",
        });
      }
    }

    // If branch ID is in token but not in header, or vice versa
    if (req.user.branchId && !headerBranchId) {
      return res.status(400).json({
        error: "X-BRANCH-ID header is required for this branch",
      });
    }

    if (!req.user.branchId && headerBranchId) {
      return res.status(403).json({
        error: "Branch ID provided but not authorized for this user",
      });
    }

    // Override body params with token values for security
    req.body = req.body || {}; // ✅ Prevent TypeError
    req.body.schoolId = req.user.schoolId;
    req.body.branchId = req.user.branchId ?? undefined;
    req.body.schoolName = req.user.schoolName;

    next();
  } catch (error) {
    console.error("Header validation error:", error);
    return res.status(500).json({
      error: "Internal server error during header validation",
    });
  }
};

const generateTenantFolderPath = (
  schoolId: string,
  branchId?: string
): string => {
  const basePath = "uploads";
  if (branchId) {
    return `${basePath}/schools/${schoolId}/branches/${branchId}`;
  }
  return `${basePath}/schools/${schoolId}`;
};

const generateAdminFolderPath = (subfolder?: string) => {
  const basePath = "admin";
  return subfolder ? `${basePath}/${subfolder}` : basePath;
};

const cleanupLocalFile = async (filePath: string) => {
  try {
    await fs.unlink(filePath);
    console.log(`Cleaned up local file: ${filePath}`);
  } catch (error) {
    console.error(`Failed to cleanup local file: ${filePath}`, error);
  }
};

const validateTenantInfo = (
  schoolId?: string,
  branchId?: string
): { isValid: boolean; error?: string } => {
  if (!schoolId || schoolId.trim() === "") {
    return { isValid: false, error: "School ID is required" };
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(schoolId)) {
    return { isValid: false, error: "Invalid school ID format" };
  }

  if (
    branchId &&
    branchId.trim() !== "" &&
    !/^[a-zA-Z0-9_-]+$/.test(branchId)
  ) {
    return { isValid: false, error: "Invalid branch ID format" };
  }

  return { isValid: true };
};

const tryGetResource = async (
  type: "image" | "video" | "raw",
  decodedPublicId: string
) => {
  try {
    return await cloudinary.api.resource(decodedPublicId, {
      resource_type: type,
    });
  } catch (err: any) {
    if (err.error?.http_code === 404) return null;
    throw err;
  }
};

const uploadToCloudinary = async (
  filePath: string,
  schoolId: string,
  branchId?: string,
  resourceType: string = "auto"
) => {
  const folderPath = generateTenantFolderPath(schoolId, branchId);

  const uploadOptions: any = {
    folder: folderPath,
    resource_type: resourceType,
    tags: [`school_${schoolId}`, ...(branchId ? [`branch_${branchId}`] : [])],
    context: {
      school_id: schoolId,
      ...(branchId && { branch_id: branchId }),
      upload_timestamp: new Date().toISOString(),
    },
  };

  return await cloudinary.uploader.upload(filePath, uploadOptions);
};

/**
 * Combined middleware for complete validation
 */
const validateTenantMiddleware = [
  validateTokenMiddleware,
  validateSchoolHeadersMiddleware,
];

export {
  AuthenticatedRequest,
  TokenPayload,
  validateTokenMiddleware,
  validateSchoolHeadersMiddleware,
  validateTenantMiddleware,
  generateAdminFolderPath,
  cleanupLocalFile,
  tryGetResource,
  generateTenantFolderPath,
  validateTenantInfo,
  uploadToCloudinary,
};
