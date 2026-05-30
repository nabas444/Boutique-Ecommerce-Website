import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Request, Response, NextFunction } from 'express';
import sharp from 'sharp';
import { AppError } from './error.middleware';

// Configure Cloudinary
cloudinary.config({ url: process.env.CLOUDINARY_URL });

// Store files in memory so we can process with sharp before uploading
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter(_req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new AppError('Only image files are allowed', 400) as any);
    }
    cb(null, true);
  },
});

// Upload a single buffer to Cloudinary, resize first with sharp
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  width = 1200,
  height = 1600
): Promise<{ url: string; publicId: string }> {
  // Resize + convert to webp for optimal size
  const processed = await sharp(buffer)
    .resize(width, height, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder, resource_type: 'image', format: 'webp' }, (err, result) => {
        if (err || !result) return reject(err || new Error('Upload failed'));
        resolve({ url: result.secure_url, publicId: result.public_id });
      })
      .end(processed);
  });
}

// Delete from Cloudinary
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

// Express middleware: upload images and attach to req.uploadedImages
export async function handleProductImageUpload(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files || files.length === 0) return next();

    const uploaded = await Promise.all(
      files.map((file) =>
        uploadToCloudinary(file.buffer, 'boutique/products').then((result) => ({
          ...result,
          alt: file.originalname.replace(/\.[^.]+$/, ''),
        }))
      )
    );

    (req as any).uploadedImages = uploaded;
    next();
  } catch (err) {
    next(err);
  }
}
