// ============= IMAGE UPLOAD UTILITY MODULE =============
// Handles image uploads with compression and data URL conversion

const ImageUpload = {
  // Upload and compress image
  uploadImage(fileInput, callback, maxWidth = 500, maxHeight = 500, quality = 0.8) {
    const file = fileInput.files[0];
    if (!file) {
      callback(null);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    // Read file and convert to data URL
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        // Compress image
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to data URL
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        callback(compressedDataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  // Validate image file
  validateImage(file) {
    if (!file) return { valid: false, error: 'No file selected' };
    if (!file.type.startsWith('image/')) return { valid: false, error: 'File must be an image' };
    if (file.size > 5 * 1024 * 1024) return { valid: false, error: 'Image must be less than 5MB' };
    return { valid: true };
  },

  // Create thumbnail from data URL
  createThumbnail(dataUrl, width = 100, height = 100) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = function() {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = dataUrl;
    });
  },

  // Upload profile avatar
  uploadAvatar(userEmail, fileInput, callback) {
    this.uploadImage(fileInput, (dataUrl) => {
      if (dataUrl) {
        Profiles.uploadAvatar(userEmail, dataUrl);
        callback(true);
      } else {
        callback(false);
      }
    }, 200, 200, 0.85);
  },

  // Upload post image
  uploadPostImage(fileInput, callback) {
    this.uploadImage(fileInput, (dataUrl) => {
      callback(dataUrl);
    }, 800, 600, 0.8);
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageUpload;
}
