import { StatusCodes } from 'http-status-codes';
import { cloudinaryV2, connectCloudinary } from '../config/cloudinary';
import AppError from './appError';

export const imageUploader = async (
    file: Express.Multer.File
): Promise<string | void> => {
    try {

        // file type validtion (image/video)
        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
        const allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/mpeg', 'video/webm'];
        const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes];

        if (!allowedTypes.includes(file.mimetype)) {
            throw new AppError('Invalid file type. Only JPG, PNG, and WebP are allowed.', StatusCodes.NOT_ACCEPTABLE);
        }

        // File size validation (max 5MB)
        const maxSize = 5 * 1024 * 1024; 
        if (file.size > maxSize) {
            throw new AppError('File size exceeds the 5MB limit.', 406);
        }

        // connecting to cloudinary
        connectCloudinary();

        // Upload to Cloudinary
        const uploadResult: any = await new Promise((resolve, reject) => {
            const uploadStream = cloudinaryV2.uploader.upload_stream(
                {
                    resource_type: 'auto',
                    public_id: `file_${Date.now()}`,
                    folder:process.env.FOLDER_NAME
                },
                (error, result) => {
                    if (error) {
                        reject('Error uploading to Cloudinary: ' + error.message);
                    }
                    resolve(result);
                }
            );

            uploadStream.end(file.buffer);
        });

        if (uploadResult && typeof uploadResult === 'object') {
            console.log('File uploaded successfully to Cloudinary');
            return `https://res.cloudinary.com/${process.env.CLOUD_NAME}/image/upload/v${uploadResult.version}/${uploadResult.public_id}.${uploadResult.format}`;
        }

        throw new Error('Failed to upload the image');
    } catch (error: any) {
        console.error('Error uploading image:', error.message);
        throw error;
    }
};
