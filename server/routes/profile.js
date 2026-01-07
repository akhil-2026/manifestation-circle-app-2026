const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log('📁 File filter check:', file.mimetype);
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

// Test Cloudinary connection
router.get('/test-cloudinary', auth, async (req, res) => {
  try {
    console.log('🧪 Testing Cloudinary connection...');
    console.log('☁️ Cloud name:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('🔑 API key:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set');
    console.log('🔐 API secret:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set');
    
    // Test Cloudinary connection
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary ping result:', result);
    
    res.json({
      message: 'Cloudinary connection successful',
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKeySet: !!process.env.CLOUDINARY_API_KEY,
      apiSecretSet: !!process.env.CLOUDINARY_API_SECRET,
      pingResult: result
    });
  } catch (error) {
    console.error('❌ Cloudinary test error:', error);
    res.status(500).json({
      message: 'Cloudinary connection failed',
      error: error.message
    });
  }
});

// Get user profile
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/', auth, async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Name is required' });
    }

    if (name.trim().length > 50) {
      return res.status(400).json({ message: 'Name cannot exceed 50 characters' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name.trim();
    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        joinedAt: user.joinedAt
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload profile picture
router.post('/upload-picture', auth, upload.single('profilePicture'), handleMulterError, async (req, res) => {
  try {
    console.log('📸 Profile picture upload request received');
    console.log('📁 File info:', req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : 'No file');
    
    if (!req.file) {
      console.log('❌ No file provided');
      return res.status(400).json({ message: 'No image file provided' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      console.log('❌ User not found:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('👤 User found:', user.name);

    // Delete old profile picture from Cloudinary if exists
    if (user.profilePicture) {
      try {
        const publicId = user.profilePicture.split('/').pop().split('.')[0];
        console.log('🗑️ Deleting old picture with publicId:', publicId);
        await cloudinary.uploader.destroy(`manifestation-circle/profiles/${publicId}`);
      } catch (deleteError) {
        console.error('Error deleting old profile picture:', deleteError);
        // Continue with upload even if deletion fails
      }
    }

    console.log('☁️ Uploading to Cloudinary...');
    
    // Upload new image to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'manifestation-circle/profiles',
          transformation: [
            { width: 200, height: 200, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' }
          ],
          public_id: `user_${user._id}_${Date.now()}`
        },
        (error, result) => {
          if (error) {
            console.error('☁️ Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('✅ Cloudinary upload success:', result.secure_url);
            resolve(result);
          }
        }
      ).end(req.file.buffer);
    });

    // Update user profile picture URL
    user.profilePicture = uploadResult.secure_url;
    await user.save();

    console.log('💾 User profile updated successfully');

    res.json({
      message: 'Profile picture updated successfully',
      profilePicture: user.profilePicture,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        joinedAt: user.joinedAt
      }
    });
  } catch (error) {
    console.error('❌ Upload profile picture error:', error);
    res.status(500).json({ 
      message: 'Failed to upload profile picture',
      error: error.message 
    });
  }
});

// Delete profile picture
router.delete('/picture', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.profilePicture) {
      return res.status(400).json({ message: 'No profile picture to delete' });
    }

    // Delete from Cloudinary
    try {
      const publicId = user.profilePicture.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`manifestation-circle/profiles/${publicId}`);
    } catch (deleteError) {
      console.error('Error deleting from Cloudinary:', deleteError);
    }

    // Remove from user record
    user.profilePicture = null;
    await user.save();

    res.json({
      message: 'Profile picture deleted successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        joinedAt: user.joinedAt
      }
    });
  } catch (error) {
    console.error('Delete profile picture error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;