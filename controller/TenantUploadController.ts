import { Response } from "express";
import path from "path";
import cloudinary from "../config/cloudinary";
import {
  uploadToCloudinary,
  generateTenantFolderPath,
  validateTenantInfo,
} from "../utils";

// export const singleUpload = async (req: any, res: Response) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     const imagePath = path.resolve(__dirname, "../uploads", req.file.filename);
//     console.log(`Resolved image path: ${imagePath}`);

//     const result = await cloudinary.uploader.upload(imagePath);

//     res.json({
//       message: "File uploaded successfully",
//       data: result,
//     });
//   } catch (error) {
//     console.error("Upload error:", error);
//     res.status(500).json({ error: error });
//   }
// };

// // export const multipleUploads = async (req: any, res: Response) => {
// //   try {
// //     if (!req.files || req.files.length === 0) {
// //       return res.status(400).json({ error: "No files uploaded" });
// //     }

// //     const fileDetails = Array.isArray(req.files)
// //       ? req.files.map((file: any) => ({
// //           filename: file.filename,
// //           mimetype: file.mimetype,
// //           size: file.size,
// //         }))
// //       : [];

// //     res.json({
// //       message: "Files uploaded successfully",
// //       files: fileDetails,
// //     });
// //   } catch (error) {
// //     res.status(500).json({ error: "Error uploading files" });
// //   }
// // };

// // export const multipleFields = async (req: any, res: Response) => {
// //   try {
// //     const files = req.files as { [fieldname: string]: Express.Multer.File[] };

// //     if (!files) {
// //       return res.status(400).json({ error: "No files uploaded" });
// //     }

// //     const response: any = {
// //       message: "Files uploaded successfully",
// //       files: {},
// //     };

// //     // Process each field's files
// //     Object.keys(files).forEach((fieldname) => {
// //       response.files[fieldname] = files[fieldname].map((file) => ({
// //         filename: file.filename,
// //         mimetype: file.mimetype,
// //         size: file.size,
// //       }));
// //     });

// //     res.json(response);
// //   } catch (error) {
// //     res.status(500).json({ error: "Error uploading files" });
// //   }
// // };

// export const multipleUploads = async (req: any, res: Response) => {
//   try {
//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ error: "No files uploaded" });
//     }

//     const uploadedFiles = await Promise.all(
//       req.files.map(async (file: any) => {
//         const imagePath = path.resolve(__dirname, "../uploads", file.filename);
//         console.log(`Resolved image path: ${imagePath}`);

//         const result = await cloudinary.uploader.upload(imagePath);
//         return result;
//       })
//     );

//     res.json({
//       message: "Files uploaded successfully",
//       files: uploadedFiles,
//     });
//   } catch (error) {
//     console.error("Error uploading files:", error);
//     res.status(500).json({ error: "Error uploading files" });
//   }
// };

// export const multipleFields = async (req: any, res: Response) => {
//   try {
//     const files = req.files as { [fieldname: string]: Express.Multer.File[] };

//     if (!files) {
//       return res.status(400).json({ error: "No files uploaded" });
//     }

//     const response: any = {
//       message: "Files uploaded successfully",
//       files: {},
//     };

//     await Promise.all(
//       Object.keys(files).map(async (fieldname) => {
//         response.files[fieldname] = await Promise.all(
//           files[fieldname].map(async (file) => {
//             const imagePath = path.resolve(
//               __dirname,
//               "../uploads",
//               file.filename
//             ); // Resolve file path
//             console.log(`Resolved image path for ${fieldname}: ${imagePath}`);

//             const result = await cloudinary.uploader.upload(imagePath); // Upload to Cloudinary
//             return result;
//           })
//         );
//       })
//     );

//     res.json(response);
//   } catch (error) {
//     console.error("Error uploading files:", error);
//     res.status(500).json({ error: "Error uploading files" });
//   }
// };

export const singleUpload = async (req: any, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Get tenant info from authenticated user (token)
    const { schoolId, branchId, schoolName } = req.user!;

    // Additional validation (though token validation should cover this)
    const validation = validateTenantInfo(schoolId, branchId);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }

    const imagePath = path.join(process.cwd(), "uploads", req.file.filename);
    console.log(`Resolved image path: ${imagePath}`);
    console.log(
      `Uploading for School: ${schoolName} (${schoolId}), Branch: ${
        branchId || "N/A"
      }`
    );

    const result = await uploadToCloudinary(imagePath, schoolId, branchId);

    res.json({
      message: "File uploaded successfully",
      data: {
        ...result,
        tenant: {
          schoolId,
          branchId: branchId || null,
          schoolName,
        },
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Error uploading file" });
  }
};

export const multipleUploads = async (req: any, res: Response) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    // Get tenant info from authenticated user (token)
    const { schoolId, branchId, schoolName } = req.user!;

    // Additional validation
    const validation = validateTenantInfo(schoolId, branchId);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }

    console.log(
      `Uploading ${
        req.files.length
      } files for School: ${schoolName} (${schoolId}), Branch: ${
        branchId || "N/A"
      }`
    );

    const uploadedFiles = await Promise.all(
      req.files.map(async (file: Express.Multer.File) => {
        const imagePath = path.join(
          process.cwd(),
          "uploads",
          req.file.filename
        );
        console.log(`Resolved image path: ${imagePath}`);

        const result = await uploadToCloudinary(imagePath, schoolId, branchId);
        return {
          ...result,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
        };
      })
    );

    res.json({
      message: "Files uploaded successfully",
      files: uploadedFiles,
      tenant: {
        schoolId,
        branchId: branchId || null,
        schoolName,
      },
    });
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).json({ error: "Error uploading files" });
  }
};

export const multipleFields = async (req: any, res: Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files || Object.keys(files).length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    // Get tenant info from authenticated user (token)
    const { schoolId, branchId, schoolName } = req.user!;

    // Additional validation
    const validation = validateTenantInfo(schoolId, branchId);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }

    console.log(
      `Uploading files from multiple fields for School: ${schoolName} (${schoolId}), Branch: ${
        branchId || "N/A"
      }`
    );

    const response: any = {
      message: "Files uploaded successfully",
      files: {},
      tenant: {
        schoolId,
        branchId: branchId || null,
        schoolName,
      },
    };

    await Promise.all(
      Object.keys(files).map(async (fieldname) => {
        const fieldFiles = files[fieldname] || [];
        response.files[fieldname] = await Promise.all(
          fieldFiles.map(async (file) => {
            const imagePath = path.join(
              process.cwd(),
              "uploads",
              file.filename
            );
            console.log(`Resolved image path for ${fieldname}: ${imagePath}`);

            const result = await uploadToCloudinary(
              imagePath,
              schoolId,
              branchId
            );
            return {
              ...result,
              originalName: file.originalname,
              mimetype: file.mimetype,
              size: file.size,
              fieldname,
            };
          })
        );
      })
    );

    res.json(response);
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).json({ error: "Error uploading files" });
  }
};

// Updated function to get files for a specific tenant
export const getTenantFiles = async (req: any, res: Response) => {
  try {
    const { schoolId: paramSchoolId, branchId: paramBranchId } = req.params;

    // Get tenant info from authenticated user (token)
    const {
      schoolId: userSchoolId,
      branchId: userBranchId,
      schoolName,
    } = req.user!;

    // Ensure user can only access their own tenant's files
    if (paramSchoolId !== userSchoolId) {
      return res.status(403).json({
        error: "Access denied: You can only access files from your own school",
      });
    }

    if (paramBranchId && paramBranchId !== userBranchId) {
      return res.status(403).json({
        error: "Access denied: You can only access files from your own branch",
      });
    }

    // Use the user's actual tenant info for the query
    const folderPath = generateTenantFolderPath(userSchoolId, userBranchId);

    // Search for files in the tenant-specific folder
    const result = await cloudinary.search
      .expression(`folder:${folderPath}/*`)
      .sort_by("created_at", "desc")
      .max_results(100)
      .execute();

    res.json({
      message: "Files retrieved successfully",
      files: result.resources,
      tenant: {
        schoolId: userSchoolId,
        branchId: userBranchId || null,
        schoolName,
      },
      total: result.total_count,
    });
  } catch (error) {
    console.error("Error retrieving files:", error);
    res.status(500).json({ error: "Error retrieving files" });
  }
};

// Updated function to delete files for a specific tenant
export const deleteTenantFile = async (req: any, res: Response) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({ error: "Public ID is required" });
    }

    // Get tenant info from authenticated user (token)
    const { schoolId, branchId, schoolName } = req.user!;

    // Verify that the file belongs to the user's tenant
    const folderPath = generateTenantFolderPath(schoolId, branchId);
    if (!publicId.startsWith(folderPath)) {
      return res
        .status(403)
        .json({ error: "Access denied: File does not belong to your tenant" });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    res.json({
      message: "File deleted successfully",
      result,
      tenant: {
        schoolId,
        branchId: branchId || null,
        schoolName,
      },
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ error: "Error deleting file" });
  }
};
