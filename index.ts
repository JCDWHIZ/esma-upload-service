import { Application, Request, Response } from "express";
require("dotenv").config();
const express = require("express");
import cors from "cors";
const app: Application = express();
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
const TenantRoutes = require("./routes/tenants");
const SuperAdminRoutes = require("./routes/superAdmin");
import path from "path";
import fs from "fs";

const isDev = process.env.NODE_ENV !== "production";
const swaggerDefinition = {
  openapi: "3.1.0",
  info: {
    title: "Esma Upload Service",
    description: "API documentation",
    version: "1.0.0",
  },
  servers: [
    {
      url: "/",
      description: "Default Server (relative URL)",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: [path.join(__dirname, isDev ? "./routes/**/*.ts" : "./routes/**/*.js")],
};

const swaggerSpec = swaggerJsdoc(options);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
console.log(
  "Swagger paths scanning:",
  path.join(__dirname, isDev ? "./routes/**/*.ts" : "./routes/**/*.js")
);

app.use("/uploads", express.static(path.resolve(__dirname, "uploads")));

app.use("/api/tenant/upload", TenantRoutes);
app.use("/api/admin/upload", SuperAdminRoutes);

// /**
//  * @openapi
//  * /images/{filename}:
//  *   get:
//  *     summary: Download an image by filename
//  *     tags:
//  *       - File Handling
//  *     parameters:
//  *       - in: path
//  *         name: filename
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: The name of the image file to retrieve
//  *     responses:
//  *       200:
//  *         description: Image file
//  *         content:
//  *           image/jpeg:
//  *             schema:
//  *               type: string
//  *               format: binary
//  *       404:
//  *         description: Image not found
//  */
// app.get("/images/:filename", (req: Request, res: Response) => {
//   const imagePath = path.resolve(__dirname, "uploads", req.params.filename);

//   res.sendFile(imagePath, (err) => {
//     if (err) {
//       console.error(err);
//       res.status(404).send("Image not found");
//     }
//   });
// });

/**
 * @openapi
 * /api/test:
 *   get:
 *     description: Test endpoint
 *     responses:
 *       200:
 *         description: Success
 */
app.get("/api/test", (req, res) => {
  res.json({ message: "Hello World" });
});
const uploadPath = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}
app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(process.env.PORT, () => {
  console.log("Server running on port: ", process.env.PORT);
});
