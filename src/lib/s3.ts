/**
 * Amazon S3 Integration for File Uploads
 * 
 * This module provides utilities for uploading files to Amazon S3.
 * Configure S3 credentials via environment variables:
 * - VITE_AWS_ACCESS_KEY_ID
 * - VITE_AWS_SECRET_ACCESS_KEY
 * - VITE_AWS_REGION
 * - VITE_AWS_S3_BUCKET_NAME
 */

interface S3UploadOptions {
  file: File;
  folder?: string; // Optional folder path in S3 bucket
  onProgress?: (progress: number) => void;
}

interface S3UploadResult {
  url: string;
  key: string;
  bucket: string;
}

/**
 * Upload file to S3 using presigned URL approach (recommended for security)
 * This requires a backend endpoint that generates presigned URLs
 */
export const uploadToS3 = async (options: S3UploadOptions): Promise<S3UploadResult> => {
  const { file, folder = 'uploads', onProgress } = options;

  // Generate a unique file key
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const fileExtension = file.name.split('.').pop();
  const fileName = `${timestamp}-${randomString}.${fileExtension}`;
  const key = folder ? `${folder}/${fileName}` : fileName;

  try {
    // Option 1: Use Supabase Storage (recommended if using Supabase)
    // This is more secure and doesn't require exposing AWS credentials
    const { supabase } = await import('./supabase');
    
    const { data, error } = await supabase.storage
      .from('uploads') // Create this bucket in Supabase Storage
      .upload(key, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(key);

    return {
      url: urlData.publicUrl,
      key: key,
      bucket: 'uploads',
    };
  } catch (error: any) {
    console.error('S3 upload error:', error);
    
    // Fallback: If Supabase Storage is not available, use direct S3 upload
    // This requires AWS SDK and credentials
    if (process.env.VITE_AWS_ACCESS_KEY_ID && process.env.VITE_AWS_SECRET_ACCESS_KEY) {
      return await uploadToS3Direct(options);
    }
    
    throw new Error(`File upload failed: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Direct S3 upload using AWS SDK (requires credentials in env)
 * Note: This approach exposes credentials in the frontend, which is not recommended for production.
 * Use presigned URLs or Supabase Storage instead.
 */
const uploadToS3Direct = async (options: S3UploadOptions): Promise<S3UploadResult> => {
  const { file, folder = 'uploads' } = options;

  // This would require @aws-sdk/client-s3 package
  // For now, we'll throw an error suggesting to use Supabase Storage
  throw new Error(
    'Direct S3 upload requires AWS SDK. ' +
    'Please use Supabase Storage or implement a backend endpoint for presigned URLs.'
  );
};

/**
 * Delete file from S3/Supabase Storage
 */
export const deleteFromS3 = async (key: string, bucket: string = 'uploads'): Promise<void> => {
  try {
    const { supabase } = await import('./supabase');
    
    const { error } = await supabase.storage
      .from(bucket)
      .remove([key]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  } catch (error: any) {
    console.error('S3 delete error:', error);
    throw new Error(`File deletion failed: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Get file URL (public or signed)
 */
export const getFileUrl = (key: string, bucket: string = 'uploads', signed: boolean = false): string => {
  const { supabase } = require('./supabase');
  
  if (signed) {
    // Generate signed URL (expires in 1 hour)
    const { data } = supabase.storage
      .from(bucket)
      .createSignedUrl(key, 3600);
    return data?.signedUrl || '';
  } else {
    // Get public URL
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(key);
    return data.publicUrl;
  }
};

/**
 * Upload multiple files
 */
export const uploadMultipleToS3 = async (
  files: File[],
  folder?: string,
  onProgress?: (progress: number) => void
): Promise<S3UploadResult[]> => {
  const results: S3UploadResult[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const result = await uploadToS3({
      file,
      folder,
      onProgress: (progress) => {
        // Calculate overall progress
        const overallProgress = ((i + progress / 100) / files.length) * 100;
        onProgress?.(overallProgress);
      },
    });
    results.push(result);
  }
  
  return results;
};

/**
 * Validate file before upload
 */
export const validateFile = (file: File, options?: {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
}): { valid: boolean; error?: string } => {
  const { maxSize = 10 * 1024 * 1024, allowedTypes } = options || {};

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit`,
    };
  }

  // Check file type
  if (allowedTypes && allowedTypes.length > 0) {
    const fileType = file.type || file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(fileType || '')) {
      return {
        valid: false,
        error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      };
    }
  }

  return { valid: true };
};

