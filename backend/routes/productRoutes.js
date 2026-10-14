import express from "express";

import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/", getProducts);
// Upload a product image (admin only).
router.post(
  "/upload",
  authMiddleware,
  adminMiddleware,
  (req, res, next) => {
    upload.single("image")(req, res, (error) => {
      if (error) {
        return res.status(400).json({
          message: error.message,
        });
      }

      next();
    });
  },
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        message: "Please select an image to upload.",
      });
    }

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    return res.status(201).json({
      message: "Product image uploaded successfully.",
      imageUrl,
    });
  },
);
router.get("/:id", getProductById);

router.post("/", authMiddleware, adminMiddleware, createProduct);

router.put("/:id", authMiddleware, adminMiddleware, updateProduct);

router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);

export default router;
