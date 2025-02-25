const API_TOKEN = "c818f0e17c8e4b2597a5db5b2a5cf735";
const BGR_API_URL = "https://engine.prod.bria-api.com/v1/background/remove";
const ENHANCE_API_URL = "https://planet-accessible-dibble.glitch.me/api/enhancer";

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
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
            // If file is selected, first upload it to a temporary hosting service
            imageUrlToProcess = await uploadImage(file);
        } else {
            imageUrlToProcess = imageUrl;
        }

        const response = await fetch(`${ENHANCE_API_URL}?url=${encodeURIComponent(imageUrlToProcess)}`);
        const data = await response.json();
        
        if (data.status === "success") {
            document.getElementById('originalImage').src = imageUrlToProcess;
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
        let imageUrlToProcess;
        
        if (file) {
            // If file is selected, first upload it to a temporary hosting service
            imageUrlToProcess = await uploadImage(file);
        } else {
            imageUrlToProcess = imageUrl;
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
            document.getElementById('originalImage').src = imageUrlToProcess;
            document.getElementById('processedImage').src = data.result_url;
        } else {
            alert('Failed to remove background');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error processing image');
    }
    hideLoading();
}

async function uploadImage(file) {
    // Using ImgBB API for temporary image hosting
    const IMGBB_API_KEY = ''; // You need to get an API key from imgbb.com
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData
    });

    const data = await response.json();
    if (data.data?.url) {
        return data.data.url;
    } else {
        throw new Error('Failed to upload image');
    }
}

function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
} 