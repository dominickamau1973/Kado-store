import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import { fileURLToPath } from "url";

// Resolve the uploads directory relative to this file.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDirectory = path.resolve(__dirname, "../uploads");

// Create the uploads directory if it does not exist.
fs.mkdirSync(uploadDirectory, { recursive: true });

// Allow only these image formats.
const allowedMimeTypes = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

// Configure where and how files are stored.
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, uploadDirectory);
  },

  filename: (req, file, callback) => {
    const extension = allowedMimeTypes[file.mimetype];

    callback(null, `${Date.now()}-${randomUUID()}${extension}`);
  },
});

// Validate the uploaded file and limit its size.
const fileFilter = (req, file, callback) => {
  if (!allowedMimeTypes[file.mimetype]) {
    return callback(new Error("Only JPG, PNG, and WEBP images are allowed."));
  }

  callback(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Maximum 5 MB
    files: 1,
  },
});

export default upload;
