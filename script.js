const API_TOKEN = "c818f0e17c8e4b2597a5db5b2a5cf735";
const BGR_API_URL = "https://engine.prod.bria-api.com/v1/background/remove";
const ENHANCE_API_URL = "https://planet-accessible-dibble.glitch.me/api/enhance";
const IMGBB_API_KEY = "384b8ef7f634a0702aaa7180910f1826"; // Get from https://api.imgbb.com/

async function uploadToHost(file) {
    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Upload failed');
        }
        
        const data = await response.json();
        if (data.data?.url) {
            return data.data.url;
        } else {
            throw new Error('Invalid response from image host');
        }
    } catch (error) {
        console.error('Upload error:', error);
        throw new Error('Failed to upload image');
    }
}

// Alternative function using base64 if image hosting fails
async function getImageUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }
        
        // Validate file size (e.g., max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Please upload an image smaller than 5MB');
            return;
        }

        // Clear URL input
        document.getElementById('imageUrl').value = '';
        
        // Show preview
        const preview = document.getElementById('imagePreview');
        preview.classList.remove('hidden');
        
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
}

// Alternative simpler version using only base64
async function processImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

async function enhanceImage() {
    const imageUrl = document.getElementById('imageUrl').value;
    const fileInput = document.getElementById('imageInput');
    const file = fileInput.files[0];

    if (!imageUrl && !file) {
        alert('Please either upload an image or enter an image URL');
        return;
    }

    showLoading();
    try {
        let imageUrlToProcess;
        
        if (file) {
            // Upload to ImgBB first
            try {
                imageUrlToProcess = await uploadToHost(file);
                document.getElementById('originalImage').src = URL.createObjectURL(file);
            } catch (error) {
                throw new Error('Failed to upload image');
            }
        } else {
            imageUrlToProcess = imageUrl;
            document.getElementById('originalImage').src = imageUrl;
        }

        // Make the enhance request
        const response = await fetch(`${ENHANCE_API_URL}?url=${encodeURIComponent(imageUrlToProcess)}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        });

        if (!response.ok) {
            throw new Error('Enhancement request failed');
        }

        let retries = 0;
        const maxRetries = 15; // 30 seconds total
        
        while (retries < maxRetries) {
            const checkResponse = await fetch(`${ENHANCE_API_URL}?url=${encodeURIComponent(imageUrlToProcess)}`);
            const data = await checkResponse.json();
            
            if (data.status === "success" && data.image) {
                document.getElementById('processedImage').src = data.image;
                showDownloadButton(data.image, 'enhanced');
                hideLoading();
                return;
            }
            
            // Wait 2 seconds before next retry
            await new Promise(resolve => setTimeout(resolve, 2000));
            retries++;
            
            // Update loading message with progress
            const loading = document.getElementById('loading');
            loading.querySelector('span').textContent = 
                `Processing your image... Please wait (${retries}/${maxRetries})`;
        }
        
        throw new Error('Enhancement process timed out');
    } catch (error) {
        console.error('Error:', error);
        alert('Error processing image: ' + error.message);
    }
    hideLoading();
}

async function removeBackground() {
    const imageUrl = document.getElementById('imageUrl').value;
    const fileInput = document.getElementById('imageInput');
    const file = fileInput.files[0];

    if (!imageUrl && !file) {
        alert('Please either upload an image or enter an image URL');
        return;
    }

    showLoading();
    try {
        let imageUrlToProcess;
        
        if (file) {
            try {
                // First try uploading to image host
                imageUrlToProcess = await uploadToHost(file);
            } catch (error) {
                // If upload fails, use base64
                console.log('Falling back to base64');
                imageUrlToProcess = await getImageUrl(file);
            }
            document.getElementById('originalImage').src = URL.createObjectURL(file);
        } else {
            imageUrlToProcess = imageUrl;
            document.getElementById('originalImage').src = imageUrl;
        }

        const formData = {
            image_url: imageUrlToProcess
        };

        const response = await fetch(BGR_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'api_token': API_TOKEN
            },
            body: new URLSearchParams(formData).toString()
        });

        const data = await response.json();
        
        if (data.result_url) {
            document.getElementById('processedImage').src = data.result_url;
            showDownloadButton(data.result_url, 'nobg');
        } else {
            alert('Failed to remove background');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error processing image: ' + error.message);
    }
    hideLoading();
}

function showDownloadButton(imageUrl, type) {
    const container = document.querySelector('.result-container:last-child');
    
    // Remove existing download button if any
    const existingBtn = container.querySelector('.download-btn');
    if (existingBtn) {
        existingBtn.remove();
    }

    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'download-btn';
    downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download Image';
    
    downloadBtn.onclick = async () => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `processed_image_${type}_${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to download image');
        }
    };

    container.appendChild(downloadBtn);
}

function showLoading() {
    const loading = document.getElementById('loading');
    loading.classList.remove('hidden');
    loading.querySelector('span').textContent = 'Processing your image... This may take up to 20 seconds';
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
} 
