const API_TOKEN = "c818f0e17c8e4b2597a5db5b2a5cf735";
const BGR_API_URL = "https://engine.prod.bria-api.com/v1/background/remove";
const ENHANCE_API_URL = "https://planet-accessible-dibble.glitch.me/api/enhancer";

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
            // Convert file to base64
            imageUrlToProcess = await getBase64(file);
            // Set original image
            document.getElementById('originalImage').src = imageUrlToProcess;
        } else {
            imageUrlToProcess = imageUrl;
            document.getElementById('originalImage').src = imageUrl;
        }

        const response = await fetch(`${ENHANCE_API_URL}?url=${encodeURIComponent(imageUrlToProcess)}`);
        const data = await response.json();
        
        if (data.status === "success") {
            document.getElementById('processedImage').src = data.image;
        } else {
            alert('Failed to enhance image');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error processing image');
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
        if (file) {
            // For file upload
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(BGR_API_URL, {
                method: 'POST',
                headers: {
                    'api_token': API_TOKEN
                },
                body: formData
            });

            const data = await response.json();
            
            if (data.result_url) {
                document.getElementById('originalImage').src = URL.createObjectURL(file);
                document.getElementById('processedImage').src = data.result_url;
            } else {
                alert('Failed to remove background');
            }
        } else {
            // For image URL
            const formData = {
                image_url: imageUrl
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
                document.getElementById('originalImage').src = imageUrl;
                document.getElementById('processedImage').src = data.result_url;
            } else {
                alert('Failed to remove background');
            }
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error processing image');
    }
    hideLoading();
}

// Helper function to convert File to base64
function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
} 
