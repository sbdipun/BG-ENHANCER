const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
let selectedFile = null;

imageInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        selectedFile = file;
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
        }
        reader.readAsDataURL(file);
    }
});

async function enhanceImage() {
    if (!selectedFile) return alert('Please select an image first');
    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
        const response = await fetch('/.netlify/functions/enhance', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        document.getElementById('enhancedResult').src = result.enhancedImage;
    } catch (error) {
        console.error('Enhancement error:', error);
    }
}

async function removeBackground() {
    if (!selectedFile) return alert('Please select an image first');
    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
        const response = await fetch('/.netlify/functions/remove-bg', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        document.getElementById('bgRemovedResult').src = result.backgroundRemoved;
    } catch (error) {
        console.error('Background removal error:', error);
    }
}
