import cloudinary from "../config/cloudinary";
import { Response } from "express";
import path from "path";
import {
  cleanupLocalFile,
  generateAdminFolderPath,
  tryGetResource,
} from "../utils";

export const adminSingleUpload = async (req: any, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const imagePath = path.join(process.cwd(), "uploads", req.file.filename);
    console.log(`Resolved image path: ${imagePath}`);

    // Get subfolder from query params (optional)
    const { folder } = req.query;
    const adminFolder = generateAdminFolderPath(folder as string);

    const result = await cloudinary.uploader.upload(imagePath, {
      folder: adminFolder,
      resource_type: "auto", // Automatically detect file type
      use_filename: true,
      unique_filename: true,
    });

    // Clean up local file after successful upload
    await cleanupLocalFile(imagePath);

    res.json({
      message: "File uploaded successfully",
      data: result,
      folder: adminFolder,
    });
  } catch (error) {
    console.error("Admin upload error:", error);
    res.status(500).json({ error: "Error uploading file" });
  }
};

// Admin multiple files upload
export const adminMultipleUploads = async (req: any, res: Response) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    // Get subfolder from query params (optional)
    const { folder } = req.query;
    const adminFolder = generateAdminFolderPath(folder as string);

    const uploadedFiles = await Promise.all(
      req.files.map(async (file: any) => {
        const imagePath = path.resolve(__dirname, "../uploads", file.filename);
        console.log(`Resolved image path: ${imagePath}`);

        const result = await cloudinary.uploader.upload(imagePath, {
          folder: adminFolder,
          resource_type: "auto",
          use_filename: true,
          unique_filename: true,
        });

        // Clean up local file after successful upload
        await cleanupLocalFile(imagePath);

        return result;
      })
    );

    res.json({
      message: "Files uploaded successfully",
      files: uploadedFiles,
      folder: adminFolder,
      total: uploadedFiles.length,
    });
  } catch (error) {
    console.error("Admin multiple upload error:", error);
    res.status(500).json({ error: "Error uploading files" });
  }
};

// Admin multiple fields upload
export const adminMultipleFields = async (req: any, res: Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files || Object.keys(files).length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    // Get subfolder from query params (optional)
    const { folder } = req.query;
    const baseAdminFolder = generateAdminFolderPath(folder as string);

    const response: any = {
      message: "Files uploaded successfully",
      files: {},
      folder: baseAdminFolder,
    };

    await Promise.all(
      Object.keys(files).map(async (fieldname) => {
        // Create field-specific subfolder
        const fieldFolder = `${baseAdminFolder}/${fieldname}`;

        response.files[fieldname] = await Promise.all(
          files[fieldname].map(async (file) => {
            const imagePath = path.resolve(
              __dirname,
              "../uploads",
              file.filename
            );
            console.log(`Resolved image path for ${fieldname}: ${imagePath}`);

            const result = await cloudinary.uploader.upload(imagePath, {
              folder: fieldFolder,
              resource_type: "auto",
              use_filename: true,
              unique_filename: true,
            });

            // Clean up local file after successful upload
            await cleanupLocalFile(imagePath);

            return result;
          })
        );
      })
    );

    res.json(response);
  } catch (error) {
    console.error("Admin multiple fields upload error:", error);
    res.status(500).json({ error: "Error uploading files" });
  }
};

// Admin function to get all files (no tenant restrictions)
export const getAdminFiles = async (req: any, res: Response) => {
  try {
    const { folder, limit = 100, nextCursor } = req.query;

    // Build search expression
    let searchExpression = "folder:admin/*";
    if (folder) {
      searchExpression = `folder:admin/${folder}/*`;
    }

    // Build search query
    let searchQuery = cloudinary.search
      .expression(searchExpression)
      .sort_by("created_at", "desc")
      .max_results(parseInt(limit as string));

    // Add cursor for pagination if provided
    if (nextCursor) {
      searchQuery = searchQuery.next_cursor(nextCursor as string);
    }

    const result = await searchQuery.execute();

    res.json({
      message: "Files retrieved successfully",
      files: result.resources,
      total: result.total_count,
      next_cursor: result.next_cursor || null,
      rate_limit_allowed: result.rate_limit_allowed,
      rate_limit_reset_at: result.rate_limit_reset_at,
    });
  } catch (error) {
    console.error("Error retrieving admin files:", error);
    res.status(500).json({ error: "Error retrieving files" });
  }
};

// Admin function to delete any file (no tenant restrictions)
export const deleteAdminFile = async (req: any, res: Response) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({ error: "Public ID is required" });
    }

    // Decode the publicId from URL encoding
    const decodedPublicId = decodeURIComponent(publicId);

    const result = await cloudinary.uploader.destroy(decodedPublicId);

    if (result.result === "ok") {
      res.json({
        message: "File deleted successfully",
        result,
        publicId: decodedPublicId,
      });
    } else {
      res.status(404).json({
        error: "File not found or already deleted",
        result,
        publicId: decodedPublicId,
      });
    }
  } catch (error) {
    console.error("Error deleting admin file:", error);
    res.status(500).json({ error: "Error deleting file" });
  }
};

// Admin function to delete multiple files
export const deleteAdminFiles = async (req: any, res: Response) => {
  try {
    const { publicIds } = req.body;

    if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
      return res.status(400).json({ error: "Array of public IDs is required" });
    }

    const results = await Promise.allSettled(
      publicIds.map((publicId: string) => cloudinary.uploader.destroy(publicId))
    );

    const successful = results
      .map((result, index) => ({
        publicId: publicIds[index],
        result: result.status === "fulfilled" ? result.value : null,
        error: result.status === "rejected" ? result.reason : null,
      }))
      .filter((item) => item.result?.result === "ok");

    const failed = results
      .map((result, index) => ({
        publicId: publicIds[index],
        result: result.status === "fulfilled" ? result.value : null,
        error: result.status === "rejected" ? result.reason : null,
      }))
      .filter((item) => item.result?.result !== "ok");

    res.json({
      message: `${successful.length} files deleted successfully`,
      successful,
      failed,
      total: publicIds.length,
    });
  } catch (error) {
    console.error("Error deleting admin files:", error);
    res.status(500).json({ error: "Error deleting files" });
  }
};

// Admin function to get file details
export const getAdminFileDetails = async (req: any, res: Response) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({ error: "Public ID is required" });
    }

    const decodedPublicId = decodeURIComponent(publicId);

    const types = ["image", "video", "raw"] as const;
    let file = null;

    for (const type of types) {
      file = await tryGetResource(type, decodedPublicId);
      if (file) break;
    }

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }
    res.json({ message: "File found", file });

    const result = await cloudinary.api.resource(decodedPublicId, {
      resource_type: file,
    });

    res.json({
      message: "File details retrieved successfully",
      file: result,
    });
  } catch (error: any) {
    console.error("Error retrieving admin file details:", error);

    if (error.error && error.error.http_code === 404) {
      return res.status(404).json({ error: "File not found" });
    }

    res.status(500).json({ error: "Error retrieving file details" });
  }
};

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
//             );
//             console.log(`Resolved image path for ${fieldname}: ${imagePath}`);

//             const result = await cloudinary.uploader.upload(imagePath);
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

// export const multipleUploads = async (req: any, res: Response) => {
//   try {
//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ error: "No files uploaded" });
//     }

//     const fileDetails = Array.isArray(req.files)
//       ? req.files.map((file: any) => ({
//           filename: file.filename,
//           mimetype: file.mimetype,
//           size: file.size,
//         }))
//       : [];

//     res.json({
//       message: "Files uploaded successfully",
//       files: fileDetails,
//     });
//   } catch (error) {
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

//     // Process each field's files
//     Object.keys(files).forEach((fieldname) => {
//       response.files[fieldname] = files[fieldname].map((file) => ({
//         filename: file.filename,
//         mimetype: file.mimetype,
//         size: file.size,
//       }));
//     });

//     res.json(response);
//   } catch (error) {
//     res.status(500).json({ error: "Error uploading files" });
//   }
// };
