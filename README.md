# README for Esma Upload Service

## Overview

The Esma Upload Service is a Node.js application designed to handle file uploads with multi-tenancy support. It utilizes Cloudinary for file storage and provides a RESTful API for uploading, retrieving, and deleting files.

## Features

- Upload single and multiple files
- Support for multiple tenants (schools and branches)
- File validation and error handling
- Integration with Cloudinary for file storage
- API documentation using Swagger

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- Docker and Docker Compose (for containerized deployment)

### Installation

1. Clone the repository:

   ```
   git clone <repository-url>
   cd esma-upload-service
   ```

2. Install dependencies:

   ```
   npm install
   ```

### Running the Application

You can run the application in two ways: directly using Node.js or using Docker.

#### Running with Node.js

1. Start the application:

   ```
   npm start
   ```

2. The application will be available at `http://localhost:3000`.

#### Running with Docker

1. Build the Docker image:

   ```
   docker-compose build
   ```

2. Start the application:

   ```
   docker-compose up
   ```

3. The application will be available at `http://localhost:3000`.

### API Endpoints

- **Test Endpoint**
  - `GET /api/test`: Returns a simple "Hello World" message.

- **File Uploads**
  - `POST /api/upload/single`: Upload a single file.
  - `POST /api/upload/multiple`: Upload multiple files.
  - `POST /api/upload/multiple-fields`: Upload files from multiple fields.

- **File Management**
  - `GET /api/files/{schoolId}`: Retrieve all files for a specific school.
  - `GET /api/files/{schoolId}/{branchId}`: Retrieve all files for a specific school and branch.
  - `DELETE /api/files/{publicId}`: Delete a specific file.

### Environment Variables

You can configure the application using environment variables. Create a `.env` file in the root directory and add the following variables:

```
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
PORT=3000
NODE_ENV=production
```

### License

This project is licensed under the MIT License. See the LICENSE file for details.