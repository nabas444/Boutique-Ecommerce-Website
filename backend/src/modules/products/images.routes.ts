import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware';
import { upload, handleProductImageUpload, deleteFromCloudinary } from '../../middleware/upload.middleware';
import { addProductImages } from './products.service';
import { db } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';

const router = Router();

// POST /api/products/:id/images — upload product images (admin)
router.post(
  '/:id/images',
  authenticate,
  requireAdmin,
  upload.array('images', 10),
  handleProductImageUpload,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const uploadedImages = (req as any).uploadedImages as { url: string; publicId: string; alt: string }[];
      if (!uploadedImages?.length) {
        throw new AppError('No images uploaded', 400);
      }

      const images = await addProductImages(req.params.id, uploadedImages);
      res.status(201).json({ success: true, data: images });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/products/images/:imageId — remove single image (admin)
router.delete(
  '/images/:imageId',
  authenticate,
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const image = await db.productImage.findUnique({ where: { id: req.params.imageId } });
      if (!image) throw new AppError('Image not found', 404);

      // Remove from Cloudinary if we stored the publicId
      if (image.publicId) {
        await deleteFromCloudinary(image.publicId).catch(() => {}); // non-fatal
      }

      await db.productImage.delete({ where: { id: req.params.imageId } });
      res.json({ success: true, message: 'Image deleted' });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/products/images/:imageId/primary — set as primary (admin)
router.patch(
  '/images/:imageId/primary',
  authenticate,
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const image = await db.productImage.findUnique({ where: { id: req.params.imageId } });
      if (!image) throw new AppError('Image not found', 404);

      // Unset all primary flags for this product
      await db.productImage.updateMany({
        where: { productId: image.productId },
        data: { isPrimary: false },
      });

      // Set the selected one as primary
      const updated = await db.productImage.update({
        where: { id: req.params.imageId },
        data: { isPrimary: true },
      });

      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
