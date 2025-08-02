const express = require("express");
const router = express.Router();
import { upload } from "../config/multer";
import {
  adminSingleUpload,
  adminMultipleUploads,
  adminMultipleFields,
  getAdminFiles,
  getAdminFileDetails,
  deleteAdminFile,
  deleteAdminFiles,
} from "../controller/AdminUploadController";

// /**
//  * @openapi
//  * components:
//  *   schemas:
//  *     FileUploadResponse:
//  *       type: object
//  *       properties:
//  *         message:
//  *           type: string
//  *           example: "File uploaded successfully"
//  *         data:
//  *           type: object
//  *           properties:
//  *             asset_id:
//  *               type: string
//  *             public_id:
//  *               type: string
//  *             version:
//  *               type: number
//  *             version_id:
//  *               type: string
//  *             signature:
//  *               type: string
//  *             width:
//  *               type: number
//  *             height:
//  *               type: number
//  *             format:
//  *               type: string
//  *             resource_type:
//  *               type: string
//  *             created_at:
//  *               type: string
//  *               format: date-time
//  *             tags:
//  *               type: array
//  *               items:
//  *                 type: string
//  *             bytes:
//  *               type: number
//  *             type:
//  *               type: string
//  *             etag:
//  *               type: string
//  *             placeholder:
//  *               type: boolean
//  *             url:
//  *               type: string
//  *             secure_url:
//  *               type: string
//  *             folder:
//  *               type: string
//  *             access_mode:
//  *               type: string
//  *             original_filename:
//  *               type: string
//  *
//  *     MultipleFileUploadResponse:
//  *       type: object
//  *       properties:
//  *         message:
//  *           type: string
//  *           example: "Files uploaded successfully"
//  *         files:
//  *           type: array
//  *           items:
//  *             $ref: '#/components/schemas/FileUploadResponse/properties/data'
//  *
//  *     MultipleFieldUploadResponse:
//  *       type: object
//  *       properties:
//  *         message:
//  *           type: string
//  *           example: "Files uploaded successfully"
//  *         files:
//  *           type: object
//  *           additionalProperties:
//  *             type: array
//  *             items:
//  *               $ref: '#/components/schemas/FileUploadResponse/properties/data'
//  *
//  *     ErrorResponse:
//  *       type: object
//  *       properties:
//  *         error:
//  *           type: string
//  *           example: "Error message"
//  *
//  *   securitySchemes:
//  *     bearerAuth:
//  *       type: http
//  *       scheme: bearer
//  *       bearerFormat: JWT
//  *
//  *   parameters:
//  *     SuperAdminAuth:
//  *       in: header
//  *       name: X-SUPER-ADMIN
//  *       required: true
//  *       schema:
//  *         type: string
//  *       description: Super admin access token
//  */

// /**
//  * @openapi
//  * /api/admin/upload/single:
//  *   post:
//  *     summary: Upload a single file (Super Admin Only)
//  *     description: Upload a single image file to Cloudinary. This endpoint is restricted to super admin users only.
//  *     tags:
//  *       - Super Admin File Upload
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - $ref: '#/components/parameters/SuperAdminAuth'
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         multipart/form-data:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               file:
//  *                 type: string
//  *                 format: binary
//  *                 description: Image file to upload (max 10MB)
//  *             required:
//  *               - file
//  *           encoding:
//  *             file:
//  *               contentType: image/*
//  *     responses:
//  *       200:
//  *         description: File uploaded successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/FileUploadResponse'
//  *       400:
//  *         description: No file uploaded or invalid file type
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  *             examples:
//  *               no_file:
//  *                 summary: No file provided
//  *                 value:
//  *                   error: "No file uploaded"
//  *               invalid_type:
//  *                 summary: Invalid file type
//  *                 value:
//  *                   error: "Only image files are allowed!"
//  *       401:
//  *         description: Unauthorized - Invalid or missing authentication
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  *       403:
//  *         description: Forbidden - Super admin access required
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  *       413:
//  *         description: File too large (max 10MB)
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  *       500:
//  *         description: Internal server error during upload
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  */
// router.post("/single", upload.single("file"), singleUpload);

// /**
//  * @openapi
//  * /api/admin/upload/multiple:
//  *   post:
//  *     summary: Upload multiple files (Super Admin Only)
//  *     description: Upload multiple image files to Cloudinary in a single request. This endpoint is restricted to super admin users only.
//  *     tags:
//  *       - Super Admin File Upload
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - $ref: '#/components/parameters/SuperAdminAuth'
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         multipart/form-data:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               files:
//  *                 type: array
//  *                 items:
//  *                   type: string
//  *                   format: binary
//  *                 description: Array of image files to upload (max 10MB each)
//  *                 minItems: 1
//  *                 maxItems: 10
//  *             required:
//  *               - files
//  *           encoding:
//  *             files:
//  *               contentType: image/*
//  *     responses:
//  *       200:
//  *         description: Files uploaded successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/MultipleFileUploadResponse'
//  *       400:
//  *         description: No files uploaded or invalid file types
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  *             examples:
//  *               no_files:
//  *                 summary: No files provided
//  *                 value:
//  *                   error: "No files uploaded"
//  *               invalid_type:
//  *                 summary: Invalid file type
//  *                 value:
//  *                   error: "Only image files are allowed!"
//  *       401:
//  *         description: Unauthorized - Invalid or missing authentication
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  *       403:
//  *         description: Forbidden - Super admin access required
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  *       413:
//  *         description: One or more files too large (max 10MB each)
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  *       500:
//  *         description: Internal server error during upload
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  */
// router.post("/multiple", upload.array("files", 10), multipleUploads);

// /**
//  * @openapi
//  * /api/admin/upload/fields:
//  *   post:
//  *     summary: Upload files to multiple fields (Super Admin Only)
//  *     description: Upload image files to different named fields in a single request. Useful for forms with multiple file upload sections. This endpoint is restricted to super admin users only.
//  *     tags:
//  *       - Super Admin File Upload
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - $ref: '#/components/parameters/SuperAdminAuth'
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         multipart/form-data:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               profile_image:
//  *                 type: array
//  *                 items:
//  *                   type: string
//  *                   format: binary
//  *                 description: Profile image files
//  *                 maxItems: 1
//  *               gallery_images:
//  *                 type: array
//  *                 items:
//  *                   type: string
//  *                   format: binary
//  *                 description: Gallery image files
//  *                 maxItems: 5
//  *               documents:
//  *                 type: array
//  *                 items:
//  *                   type: string
//  *                   format: binary
//  *                 description: Document image files
//  *                 maxItems: 3
//  *             minProperties: 1
//  *           encoding:
//  *             profile_image:
//  *               contentType: image/*
//  *             gallery_images:
//  *               contentType: image/*
//  *             documents:
//  *               contentType: image/*
//  *           examples:
//  *             example1:
//  *               summary: Upload to multiple fields
//  *               value:
//  *                 profile_image: "[binary file data]"
//  *                 gallery_images: "[binary file data array]"
//  *     responses:
//  *       200:
//  *         description: Files uploaded successfully to specified fields
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/MultipleFieldUploadResponse'
//  *             example:
//  *               message: "Files uploaded successfully"
//  *               files:
//  *                 profile_image:
//  *                   - public_id: "profile/abc123"
//  *                     secure_url: "https://res.cloudinary.com/demo/image/upload/v1234567890/profile/abc123.jpg"
//  *                     format: "jpg"
//  *                 gallery_images:
//  *                   - public_id: "gallery/def456"
//  *                     secure_url: "https://res.cloudinary.com/demo/image/upload/v1234567890/gallery/def456.jpg"
//  *                     format: "jpg"
//  *                   - public_id: "gallery/ghi789"
//  *                     secure_url: "https://res.cloudinary.com/demo/image/upload/v1234567890/gallery/ghi789.jpg"
//  *                     format: "jpg"
//  *       400:
//  *         description: No files uploaded or invalid file types
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  *             examples:
//  *               no_files:
//  *                 summary: No files provided
//  *                 value:
//  *                   error: "No files uploaded"
//  *               invalid_type:
//  *                 summary: Invalid file type
//  *                 value:
//  *                   error: "Only image files are allowed!"
//  *       401:
//  *         description: Unauthorized - Invalid or missing authentication
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  *       403:
//  *         description: Forbidden - Super admin access required
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  *       413:
//  *         description: One or more files too large (max 10MB each)
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  *       500:
//  *         description: Internal server error during upload
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/ErrorResponse'
//  */
// router.post(
//   "/fields",
//   upload.fields([
//     { name: "profile_image", maxCount: 1 },
//     { name: "gallery_images", maxCount: 5 },
//     { name: "documents", maxCount: 3 },
//   ]),
//   multipleFields
// );

/**
 * @openapi
 * components:
 *   schemas:
 *     FileUploadResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "File uploaded successfully"
 *         data:
 *           type: object
 *           properties:
 *             asset_id:
 *               type: string
 *             public_id:
 *               type: string
 *             version:
 *               type: number
 *             version_id:
 *               type: string
 *             signature:
 *               type: string
 *             width:
 *               type: number
 *             height:
 *               type: number
 *             format:
 *               type: string
 *             resource_type:
 *               type: string
 *             created_at:
 *               type: string
 *               format: date-time
 *             tags:
 *               type: array
 *               items:
 *                 type: string
 *             bytes:
 *               type: number
 *             type:
 *               type: string
 *             etag:
 *               type: string
 *             placeholder:
 *               type: boolean
 *             url:
 *               type: string
 *             secure_url:
 *               type: string
 *             folder:
 *               type: string
 *             access_mode:
 *               type: string
 *             original_filename:
 *               type: string
 *         folder:
 *           type: string
 *           description: The Cloudinary folder path where file was uploaded
 *           example: "admin/banners"
 *
 *     MultipleFileUploadResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Files uploaded successfully"
 *         files:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               asset_id:
 *                 type: string
 *               public_id:
 *                 type: string
 *               secure_url:
 *                 type: string
 *               format:
 *                 type: string
 *         folder:
 *           type: string
 *         total:
 *           type: integer
 *
 *     MultipleFieldUploadResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Files uploaded successfully"
 *         files:
 *           type: object
 *           additionalProperties:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 asset_id:
 *                   type: string
 *                 public_id:
 *                   type: string
 *                 secure_url:
 *                   type: string
 *                 format:
 *                   type: string
 *         folder:
 *           type: string
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "Error message"
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   responses:
 *     Unauthorized:
 *       description: Unauthorized - Invalid or missing authentication
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *     Forbidden:
 *       description: Forbidden - Super admin access required
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *     InternalError:
 *       description: Internal server error
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/admin/upload/single:
 *   post:
 *     summary: Upload a single file (Super Admin Only)
 *     description: Upload a single image file to Cloudinary admin folder.
 *     tags:
 *       - Super Admin File Upload
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: folder
 *         required: false
 *         schema:
 *           type: string
 *         description: Optional subfolder within admin directory
 *         example: "banners"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload (max 10MB)
 *             required:
 *               - file
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileUploadResponse'
 *       400:
 *         description: No file uploaded or invalid file type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       413:
 *         description: File too large (max 10MB)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post("/single", upload.single("file"), adminSingleUpload);

/**
 * @openapi
 * /api/admin/upload/multiple:
 *   post:
 *     summary: Upload multiple files (Super Admin Only)
 *     description: Upload multiple image files to Cloudinary in a single request.
 *     tags:
 *       - Super Admin File Upload
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: folder
 *         required: false
 *         schema:
 *           type: string
 *         description: Optional subfolder within admin directory
 *         example: "banners"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Array of image files to upload (max 10MB each)
 *                 minItems: 1
 *                 maxItems: 10
 *             required:
 *               - files
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MultipleFileUploadResponse'
 *       400:
 *         description: No files uploaded or invalid file types
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       413:
 *         description: One or more files too large (max 10MB each)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post("/multiple", upload.array("files", 10), adminMultipleUploads);

/**
 * @openapi
 * /api/admin/upload/fields:
 *   post:
 *     summary: Upload files to multiple fields (Super Admin Only)
 *     description: Upload image files to different named fields in a single request.
 *     tags:
 *       - Super Admin File Upload
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: folder
 *         required: false
 *         schema:
 *           type: string
 *         description: Optional subfolder within admin directory
 *         example: "forms"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profile_image:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Profile image files
 *                 maxItems: 1
 *               gallery_images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Gallery image files
 *                 maxItems: 5
 *               documents:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Document image files
 *                 maxItems: 3
 *             minProperties: 1
 *     responses:
 *       200:
 *         description: Files uploaded successfully to specified fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MultipleFieldUploadResponse'
 *       400:
 *         description: No files uploaded or invalid file types
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       413:
 *         description: One or more files too large (max 10MB each)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post(
  "/fields",
  upload.fields([
    { name: "profile_image", maxCount: 1 },
    { name: "gallery_images", maxCount: 5 },
    { name: "documents", maxCount: 3 },
  ]),
  adminMultipleFields
);

/**
 * @openapi
 * /api/admin/upload/files:
 *   get:
 *     summary: Get all admin files (Super Admin Only)
 *     description: Retrieve all files uploaded to admin folders with pagination support.
 *     tags:
 *       - Super Admin File Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: folder
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter by specific subfolder within admin directory
 *         example: "banners"
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 500
 *           default: 100
 *         description: Maximum number of files to return
 *       - in: query
 *         name: nextCursor
 *         required: false
 *         schema:
 *           type: string
 *         description: Cursor for pagination (get next page)
 *     responses:
 *       200:
 *         description: Files retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 files:
 *                   type: array
 *                   items:
 *                     type: object
 *                 total:
 *                   type: integer
 *                 next_cursor:
 *                   type: string
 *                   nullable: true
 *                 rate_limit_allowed:
 *                   type: integer
 *                 rate_limit_reset_at:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get("/files", getAdminFiles);

/**
 * @openapi
 * /api/admin/upload/file/{publicId}:
 *   get:
 *     summary: Get file details (Super Admin Only)
 *     description: Retrieve detailed information about a specific file.
 *     tags:
 *       - Super Admin File Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *         description: The public ID of the file (URL encoded)
 *         example: "admin%2Fbanners%2Fsample123"
 *     responses:
 *       200:
 *         description: File details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 file:
 *                   type: object
 *       404:
 *         description: File not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get("/file/:publicId", getAdminFileDetails);

/**
 * @openapi
 * /api/admin/upload/file/{publicId}:
 *   delete:
 *     summary: Delete a specific file (Super Admin Only)
 *     description: Delete a file from Cloudinary by its public ID.
 *     tags:
 *       - Super Admin File Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *         description: The public ID of the file to delete (URL encoded)
 *         example: "admin%2Fbanners%2Fsample123"
 *     responses:
 *       200:
 *         description: File deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 result:
 *                   type: object
 *                   properties:
 *                     result:
 *                       type: string
 *                       example: "ok"
 *                 publicId:
 *                   type: string
 *       404:
 *         description: File not found or already deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       400:
 *         description: Public ID is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.delete("/file/:publicId", deleteAdminFile);

/**
 * @openapi
 * /api/admin/upload/files:
 *   delete:
 *     summary: Delete multiple files (Super Admin Only)
 *     description: Delete multiple files from Cloudinary by their public IDs.
 *     tags:
 *       - Super Admin File Management
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               publicIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of public IDs to delete
 *                 example: ["admin/banners/sample123", "admin/logos/sample456"]
 *                 minItems: 1
 *                 maxItems: 100
 *             required:
 *               - publicIds
 *     responses:
 *       200:
 *         description: Bulk delete operation completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 successful:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       publicId:
 *                         type: string
 *                       result:
 *                         type: object
 *                 failed:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       publicId:
 *                         type: string
 *                       error:
 *                         type: string
 *                 total:
 *                   type: integer
 *       400:
 *         description: Invalid request body
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.delete("/files", deleteAdminFiles);

module.exports = router;
