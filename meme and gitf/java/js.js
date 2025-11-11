// script.js

// Khởi tạo Canvas và Context
const canvas = document.getElementById('memeCanvas');
const ctx = canvas.getContext('2d');

// Lấy các phần tử UI
const imageUpload = document.getElementById('imageUpload');
const topText = document.getElementById('topText');
const bottomText = document.getElementById('bottomText');
const drawButton = document.getElementById('drawButton');
const downloadButton = document.getElementById('downloadButton');
const errorMessage = document.getElementById('errorMessage');
const templateCards = document.querySelectorAll('.template-card');

// Lấy các phần tử Modal và Profile Dropdown
const templateModal = document.getElementById('templateModal');
const closeModalButton = document.getElementById('closeModalButton');
const useTemplateButton = document.getElementById('useTemplateButton');
const userProfileButton = document.getElementById('userProfileButton'); // Nút toggle
const profileDropdownMenu = document.getElementById('profileDropdownMenu'); // Khung dropdown

let originalImage = null; // Biến lưu trữ đối tượng hình ảnh gốc

// Giả định trạng thái đăng nhập
let isLoggedIn = false; // THAY ĐỔI BIẾN NÀY THÀNH true ĐỂ XEM TRẠNG THÁI ĐÃ ĐĂNG NHẬP

// --- Hàm tạo nội dung Dropdown dựa trên trạng thái đăng nhập ---
function updateProfileDropdown() {
    let content = '';
    
    if (isLoggedIn) {
        // TRẠNG THÁI ĐÃ ĐĂNG NHẬP
        content = `
            <div class="p-4 border-b border-gray-100">
                <p class="font-bold text-gray-800">Chào, UserDemo!</p>
                <p class="text-sm text-gray-500">user.demo@memeforge.com</p>
            </div>
            <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <span class="font-semibold">Trang Cá Nhân</span>
            </a>
            <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Template Của Tôi
            </a>
            <div class="border-t border-gray-100">
                <a href="#" id="logoutButton" class="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-semibold">
                    Đăng Xuất
                </a>
            </div>
        `;
    } else {
        // TRẠNG THÁI CHƯA ĐĂNG NHẬP (Chuyển hướng đến login.html)
        content = `
            <div class="p-4">
                <p class="font-semibold text-gray-700 mb-2">Chào mừng đến với KYM/MemeForge!</p>
                <a href="login.html" class="block w-full text-center bg-orange-600 text-white font-bold py-2 rounded-lg hover:bg-orange-700 transition mb-2">
                    Đăng Nhập
                </a>
                <a href="login.html?mode=signup" class="block w-full text-center text-gray-700 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition text-sm">
                    Đăng Ký
                </a>
            </div>
        `;
    }
    
    profileDropdownMenu.innerHTML = content;

    // Thêm listener cho nút Đăng Xuất (nếu có)
    if (isLoggedIn) {
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                isLoggedIn = false;
                alert('Bạn đã đăng xuất thành công.');
                hideProfileDropdown();
                updateProfileDropdown(); // Cập nhật lại dropdown
            });
        }
    }
}

// --- Logic Dropdown ---
function handleProfileClick() {
    profileDropdownMenu.classList.toggle('hidden');
}

function hideProfileDropdown() {
    profileDropdownMenu.classList.add('hidden');
}

// --- Hàm tải ảnh từ URL và vẽ ---
function loadImageAndDraw(imageUrl) {
    templateCards.forEach(c => c.classList.remove('border-orange-500'));
    
    const img = new Image();
    img.crossOrigin = "Anonymous"; 
    
    img.onload = () => {
        originalImage = img;
        drawMeme(); 
    };
    img.onerror = () => {
        errorMessage.textContent = "Không thể tải ảnh Template. Vui lòng thử lại hoặc tải ảnh của bạn.";
        errorMessage.classList.remove('hidden');
        originalImage = null;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    img.src = imageUrl;
    
    const activeCard = Array.from(templateCards).find(c => c.getAttribute('data-img') === imageUrl);
    if(activeCard) {
        activeCard.classList.add('border-orange-500');
    }
}


// --- Hàm vẽ Meme lên Canvas ---
function drawMeme() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (!originalImage) {
        errorMessage.textContent = "Vui lòng tải ảnh lên hoặc chọn Template!";
        errorMessage.classList.remove('hidden');
        downloadButton.disabled = true;
        return;
    }
    errorMessage.classList.add('hidden');
    downloadButton.disabled = false;

    // Căn chỉnh ảnh vào Canvas (Fit/Contain)
    let canvasWidth = 500;
    let canvasHeight = 400;

    const imageRatio = originalImage.width / originalImage.height;
    const canvasRatio = canvasWidth / canvasHeight;

    let renderWidth, renderHeight, xOffset, yOffset;

    if (imageRatio > canvasRatio) {
        renderWidth = canvasWidth;
        renderHeight = canvasWidth / imageRatio;
        xOffset = 0;
        yOffset = (canvasHeight - renderHeight) / 2;
    } else {
        renderHeight = canvasHeight;
        renderWidth = canvasHeight * imageRatio;
        xOffset = (canvasWidth - renderWidth) / 2;
        yOffset = 0;
    }

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    ctx.drawImage(originalImage, xOffset, yOffset, renderWidth, renderHeight);

    // Thiết lập thuộc tính Văn bản Meme
    const tText = topText.value.toUpperCase();
    const bText = bottomText.value.toUpperCase();

    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 36px Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif'; 

    const padding = 10;
    const maxWidth = canvasWidth - padding * 2;

    function drawTextWithStroke(text, x, y) {
        ctx.strokeText(text, x, y, maxWidth);
        ctx.fillText(text, x, y, maxWidth);
    }

    drawTextWithStroke(tText, canvasWidth / 2, yOffset + 30); 
    drawTextWithStroke(bText, canvasWidth / 2, yOffset + renderHeight - 30);
}

// --- Logic Modal ---
function showModal(title, description, imageUrl) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalDescription').textContent = description;
    document.getElementById('modalImage').src = imageUrl;
    useTemplateButton.setAttribute('data-img', imageUrl);
    document.getElementById('templateModal').classList.remove('hidden');
    document.getElementById('templateModal').classList.add('flex');
}

function hideModal() {
    document.getElementById('templateModal').classList.add('hidden');
    document.getElementById('templateModal').classList.remove('flex');
}

// --- Event Listeners ---

imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            loadImageAndDraw(event.target.result);
        };
        reader.readAsDataURL(file);
    } else {
        originalImage = null;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    templateCards.forEach(c => c.classList.remove('border-orange-500'));
});

templateCards.forEach(card => {
    card.addEventListener('click', () => {
        const title = card.getAttribute('data-title');
        const description = card.getAttribute('data-description');
        const imageUrl = card.getAttribute('data-img');
        showModal(title, description, imageUrl);
    });
});

useTemplateButton.addEventListener('click', () => {
    const imageUrl = useTemplateButton.getAttribute('data-img');
    loadImageAndDraw(imageUrl);
    imageUpload.value = '';
    hideModal();
});

closeModalButton.addEventListener('click', hideModal);

document.getElementById('templateModal').addEventListener('click', (e) => {
    if (e.target.id === 'templateModal') {
        hideModal();
    }
});

drawButton.addEventListener('click', drawMeme);

downloadButton.addEventListener('click', () => {
    if (!originalImage) {
        errorMessage.textContent = "Không có Meme nào để tải xuống.";
        errorMessage.classList.remove('hidden');
        return;
    }
    
    const dataURL = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = 'memeforge-' + Date.now() + '.png'; 
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});

// Xử lý nút Profile
if (userProfileButton) {
    userProfileButton.addEventListener('click', (e) => {
        e.stopPropagation();
        handleProfileClick();
    });
}

// Đóng dropdown khi click bên ngoài
document.addEventListener('click', (e) => {
    const container = document.getElementById('profileDropdownContainer');
    if (container && !container.contains(e.target)) {
        hideProfileDropdown();
    }
});

topText.addEventListener('input', drawMeme);
bottomText.addEventListener('input', drawMeme);

// Chạy khi trang load
window.onload = function() {
    const placeholderUrl = 'https://placehold.co/500x400/1e293b/f8fafc?text=Bắt+đầu+tạo+Meme+với+Template';
    loadImageAndDraw(placeholderUrl);
    
    templateCards.forEach(c => c.classList.remove('border-orange-500'));
    
    updateProfileDropdown();
}