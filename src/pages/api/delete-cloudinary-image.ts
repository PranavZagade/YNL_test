import type { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';

// Validate Cloudinary configuration
const requiredEnvVars = {
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
};

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('❌ Missing required Cloudinary environment variables:', missingVars);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Method validation
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      allowedMethods: ['POST']
    });
  }

  try {
    const { publicId } = req.body;

    // Input validation
    if (!publicId) {
      console.error('❌ Missing publicId in request body');
      return res.status(400).json({ 
        error: 'Missing required field: publicId',
        required: ['publicId']
      });
    }

    // Validate publicId format (should be a string and not empty)
    if (typeof publicId !== 'string' || publicId.trim().length === 0) {
      console.error('❌ Invalid publicId format:', publicId);
      return res.status(400).json({ 
        error: 'Invalid publicId format',
        received: publicId,
        expected: 'Non-empty string'
      });
    }

    // Check if Cloudinary is properly configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('❌ Cloudinary not properly configured');
      return res.status(500).json({ 
        error: 'Image service not configured',
        details: 'Missing Cloudinary environment variables',
        missing: missingVars
      });
    }

    console.log('🗑️ Deleting image from Cloudinary:', publicId);

    // Delete image with retry logic
    let deleteResult;
    const maxRetries = 3;
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🗑️ Deleting image (attempt ${attempt}/${maxRetries})...`);
        
        deleteResult = await cloudinary.uploader.destroy(publicId);
        
        console.log('✅ Image deleted successfully:', {
          publicId,
          result: deleteResult.result,
          attempt
        });
        break; // Success, exit retry loop
        
      } catch (deleteError: any) {
        lastError = deleteError;
        console.error(`❌ Image deletion attempt ${attempt} failed:`, {
          publicId,
          error: deleteError.message,
          code: deleteError.code,
          http_code: deleteError.http_code
        });

        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff)
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    if (!deleteResult) {
      console.error('❌ All image deletion attempts failed');
      return res.status(500).json({ 
        error: 'Failed to delete image after multiple attempts',
        details: lastError?.message || 'Unknown error',
        publicId,
        attempts: maxRetries
      });
    }

    // Log success metrics
    console.log('📊 Image deletion metrics:', {
      publicId,
      result: deleteResult.result,
      status: 'deleted',
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({ 
      success: true, 
      data: deleteResult,
      metrics: {
        publicId,
        result: deleteResult.result,
        status: 'deleted',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ Cloudinary image deletion error:', {
      error: error.message,
      stack: error.stack,
      body: req.body
    });

    return res.status(500).json({ 
      error: 'Failed to delete image',
      details: error.message || 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
} 