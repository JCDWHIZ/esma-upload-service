// const express = require("express");
// const router = express.Router();
// import { upload } from "../config/multer";
// import {
//   multipleFields,
//   multipleUploads,
//   singleUpload,
// } from "../controller/uploadController";

// /**
//  * @openapi
//  * /api/upload/tenant/single:
//  *   post:
//  *     summary: Upload a single file
//  *     tags:
//  *       - Tenant File Handling
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
//  *     responses:
//  *       200:
//  *         description: File uploaded successfully
//  *       400:
//  *         description: No file uploaded
//  *       500:
//  *         description: Internal server error
//  */
// router.post("/upload/single", upload.single("file"), singleUpload);

// /**
//  * @openapi
//  * /api/upload/tenant/multiple:
//  *   post:
//  *     summary: Upload multiple files (same field)
//  *     tags:
//  *       - Tenant File Handling
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
//  *     responses:
//  *       200:
//  *         description: Files uploaded successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                 files:
//  *                   type: array
//  *                   items:
//  *                     type: object
//  */
// router.post("/upload/multiple", upload.array("files", 5), multipleUploads);

// const multipleUpload = upload.fields([
//   { name: "avatar", maxCount: 1 },
//   { name: "gallery", maxCount: 5 },
// ]);
// /**
//  * @openapi
//  * /api/upload/tenant/multiple-fields:
//  *   post:
//  *     summary: Upload files from multiple fields
//  *     tags:
//  *       - Tenant File Handling
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         multipart/form-data:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               frontImage:
//  *                 type: string
//  *                 format: binary
//  *               backImage:
//  *                 type: string
//  *                 format: binary
//  *     responses:
//  *       200:
//  *         description: Files uploaded successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                 files:
//  *                   type: object
//  *                   properties:
//  *                     frontImage:
//  *                       type: array
//  *                       items:
//  *                         type: object
//  *                     backImage:
//  *                       type: array
//  *                       items:
//  *                         type: object
//  */
// router.post("/fields", multipleUpload, multipleFields);

// module.exports = router;
import express, { Router } from "express";
const router: Router = express.Router();
import { upload } from "../config/multer";
import {
  multipleFields,
  multipleUploads,
  singleUpload,
  getTenantFiles,
  deleteTenantFile,
} from "../controller/TenantUploadController";
import { validateTenantMiddleware } from "../utils";

// Middleware to validate tenant information
/**
 * @openapi
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *     TenantInfo:
 *       type: object
 *       properties:
 *         schoolId:
 *           type: string
 *         branchId:
 *           type: string
 *           nullable: true
 *         schoolName:
 *           type: string
 */

/**
 * @openapi
 * /api/tenant/upload/single:
 *   post:
 *     summary: Upload a single file with multi-tenancy support
 *     tags:
 *       - Tenant File Handling
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: X-SCHOOL-ID
 *         required: true
 *         schema:
 *           type: string
 *         description: School identifier (must match token)
 *       - in: header
 *         name: X-BRANCH-ID
 *         required: false
 *         schema:
 *           type: string
 *         description: Branch identifier (must match token if provided)
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
 *             required:
 *               - file
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     public_id:
 *                       type: string
 *                     secure_url:
 *                       type: string
 *                     folder:
 *                       type: string
 *                     tenant:
 *                       $ref: '#/components/schemas/TenantInfo'
 *       400:
 *         description: No file uploaded or invalid headers
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Header values don't match token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/single",
  upload.single("file"),
  validateTenantMiddleware,
  singleUpload
);

/**
 * @openapi
 * /api/tenant/upload/multiple:
 *   post:
 *     summary: Upload multiple files (same field) with multi-tenancy support
 *     tags:
 *       - Tenant File Handling
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: X-SCHOOL-ID
 *         required: true
 *         schema:
 *           type: string
 *         description: School identifier (must match token)
 *       - in: header
 *         name: X-BRANCH-ID
 *         required: false
 *         schema:
 *           type: string
 *         description: Branch identifier (must match token if provided)
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
 *             required:
 *               - files
 *     responses:
 *       200:
 *         description: Files uploaded successfully
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
 *                     properties:
 *                       public_id:
 *                         type: string
 *                       secure_url:
 *                         type: string
 *                       folder:
 *                         type: string
 *                       originalName:
 *                         type: string
 *                       mimetype:
 *                         type: string
 *                       size:
 *                         type: number
 *                 tenant:
 *                   $ref: '#/components/schemas/TenantInfo'
 *       400:
 *         description: No files uploaded or invalid headers
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Header values don't match token
 *       500:
 *         description: Internal server error
 */
router.post(
  "/multiple",
  upload.array("files", 10),
  validateTenantMiddleware,
  multipleUploads
);

const multipleUpload = upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "gallery", maxCount: 5 },
  { name: "documents", maxCount: 10 },
]);

/**
 * @openapi
 * /api/tenant/upload/multiple-fields:
 *   post:
 *     summary: Upload files from multiple fields with multi-tenancy support
 *     tags:
 *       - Tenant File Handling
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: X-SCHOOL-ID
 *         required: true
 *         schema:
 *           type: string
 *         description: School identifier (must match token)
 *       - in: header
 *         name: X-BRANCH-ID
 *         required: false
 *         schema:
 *           type: string
 *         description: Branch identifier (must match token if provided)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *               gallery:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               documents:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 files:
 *                   type: object
 *                   properties:
 *                     avatar:
 *                       type: array
 *                       items:
 *                         type: object
 *                     gallery:
 *                       type: array
 *                       items:
 *                         type: object
 *                     documents:
 *                       type: array
 *                       items:
 *                         type: object
 *                 tenant:
 *                   $ref: '#/components/schemas/TenantInfo'
 *       400:
 *         description: No files uploaded or invalid headers
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Header values don't match token
 *       500:
 *         description: Internal server error
 */
router.post(
  "/multiple-fields",
  multipleUpload,
  validateTenantMiddleware,
  multipleFields
);

/**
 * @openapi
 * /api/tenant/upload/files/{schoolId}:
 *   get:
 *     summary: Get all files for a specific school
 *     tags:
 *       - Tenant File Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: string
 *         description: School identifier (must match token)
 *       - in: header
 *         name: X-SCHOOL-ID
 *         required: true
 *         schema:
 *           type: string
 *         description: School identifier (must match token and path parameter)
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
 *                 tenant:
 *                   $ref: '#/components/schemas/TenantInfo'
 *                 total:
 *                   type: number
 *       400:
 *         description: Invalid school ID
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Access denied to this school's files
 *       500:
 *         description: Internal server error
 */
router.get("/files/:schoolId", validateTenantMiddleware, getTenantFiles);

/**
 * @openapi
 * /api/tenant/upload/files/{schoolId}/{branchId}:
 *   get:
 *     summary: Get all files for a specific school and branch
 *     tags:
 *       - Tenant File Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: string
 *         description: School identifier (must match token)
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: string
 *         description: Branch identifier (must match token)
 *       - in: header
 *         name: X-SCHOOL-ID
 *         required: true
 *         schema:
 *           type: string
 *         description: School identifier (must match token and path parameter)
 *       - in: header
 *         name: X-BRANCH-ID
 *         required: true
 *         schema:
 *           type: string
 *         description: Branch identifier (must match token and path parameter)
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
 *                 tenant:
 *                   $ref: '#/components/schemas/TenantInfo'
 *                 total:
 *                   type: number
 *       400:
 *         description: Invalid school or branch ID
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Access denied to this branch's files
 *       500:
 *         description: Internal server error
 */
router.get(
  "/files/:schoolId/:branchId",
  validateTenantMiddleware,
  getTenantFiles
);

/**
 * @openapi
 * /api/tenant/upload/files/{publicId}:
 *   delete:
 *     summary: Delete a specific file
 *     tags:
 *       - Tenant File Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *         description: Cloudinary public ID of the file
 *       - in: header
 *         name: X-SCHOOL-ID
 *         required: true
 *         schema:
 *           type: string
 *         description: School identifier (must match token)
 *       - in: header
 *         name: X-BRANCH-ID
 *         required: false
 *         schema:
 *           type: string
 *         description: Branch identifier (must match token if provided)
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
 *                 tenant:
 *                   $ref: '#/components/schemas/TenantInfo'
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Access denied to this file
 *       500:
 *         description: Internal server error
 */
router.delete("/files/:publicId", validateTenantMiddleware, deleteTenantFile);

export default router;
