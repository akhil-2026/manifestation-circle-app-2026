# Cloudinary Setup Guide

This guide will help you set up Cloudinary for profile picture uploads in the Manifestation Circle app.

## Step 1: Create a Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for a free account
3. Verify your email address

## Step 2: Get Your Cloudinary Credentials

1. After logging in, go to your Dashboard
2. You'll see your account details including:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

## Step 3: Configure Environment Variables

### For Local Development

Update your `server/.env` file with your Cloudinary credentials:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret
```

### For Production (Render)

1. Go to your Render dashboard
2. Select your backend service
3. Go to "Environment" tab
4. Add these environment variables:
   - `CLOUDINARY_CLOUD_NAME`: Your cloud name
   - `CLOUDINARY_API_KEY`: Your API key
   - `CLOUDINARY_API_SECRET`: Your API secret

## Step 4: Cloudinary Settings (Optional)

For better security and organization, you can:

1. **Create Upload Presets** (optional):
   - Go to Settings > Upload
   - Create a preset for profile pictures
   - Set folder to `manifestation-circle/profiles`
   - Set transformations (200x200, crop: fill, gravity: face)

2. **Configure Auto-moderation** (optional):
   - Go to Settings > Security
   - Enable auto-moderation for uploaded images

## Step 5: Test the Setup

1. Start your development server
2. Go to the Profile page
3. Try uploading a profile picture
4. Check your Cloudinary Media Library to see if the image was uploaded

## Features Included

- ✅ **Automatic Image Optimization**: Images are automatically optimized for web
- ✅ **Face Detection**: Profile pictures are cropped focusing on faces
- ✅ **Size Limits**: 5MB maximum file size
- ✅ **Format Support**: JPG, PNG, GIF supported
- ✅ **Automatic Cleanup**: Old profile pictures are deleted when new ones are uploaded
- ✅ **Responsive Images**: Images are served in optimal formats

## Folder Structure

Images will be organized in Cloudinary as:
```
manifestation-circle/
└── profiles/
    ├── user_[userId]_[timestamp].jpg
    ├── user_[userId]_[timestamp].png
    └── ...
```

## Troubleshooting

### Common Issues:

1. **"Invalid API credentials"**
   - Double-check your CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET
   - Make sure there are no extra spaces or quotes

2. **"Upload failed"**
   - Check if the image file is under 5MB
   - Ensure the file is a valid image format (JPG, PNG, GIF)

3. **Images not displaying**
   - Check if the Cloudinary URL is accessible
   - Verify your cloud name is correct

### Getting Help:

- Check Cloudinary's [documentation](https://cloudinary.com/documentation)
- Review the server logs for detailed error messages
- Test your credentials using Cloudinary's API explorer

## Free Tier Limits

Cloudinary's free tier includes:
- 25 GB storage
- 25 GB monthly bandwidth
- 1,000 transformations per month

This should be more than enough for a small manifestation circle app!