import express from "express";
import {
  createProduct,
  updateProduct,
  patchProduct,
  deleteProduct,
  bulkDeleteProducts,
  uploadProductImage,
} from "../../controllers/product/product.controller.js";
import verifyToken from "../../middlewares/verifyToken.middle.js";
import isAdmin from "../../middlewares/isAdmin.middleware.js";
import { upload } from "../../middlewares/multer.middleware.js";
import { createLimiter, updateLimiter, deleteLimiter } from "../../config/rateLimit.config.js";

const router = express.Router();

router.use(verifyToken, isAdmin);

router.post(  "/",             createLimiter, createProduct);
router.post(  "/upload-image", createLimiter, upload.single("image"), uploadProductImage);
router.delete("/bulk-delete",  deleteLimiter, bulkDeleteProducts);
router.put(   "/:id",          updateLimiter, updateProduct);
router.patch( "/:id",          updateLimiter, patchProduct);
router.delete("/:id",          deleteLimiter, deleteProduct);

export default router;
