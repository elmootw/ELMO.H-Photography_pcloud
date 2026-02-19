// ====== 全域變數 ======
let albumsData = [];
let currentFilter = 'all';
let currentAlbumImages = [];
let currentImageIndex = 0;
let currentPage = 'albums'; // 'albums', 'street', 或 'landscape'

// ====== 初始化 ======
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadAlbums();
    setupEventListeners();
    preventImageProtection();
});

// ====== 主題系統 ======
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
}

function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        updateThemeIcons(true);
    } else {
        document.body.classList.remove('dark-theme');
        updateThemeIcons(false);
    }
    localStorage.setItem('theme', theme);
}

function toggleTheme() {
    const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
}

function updateThemeIcons(isDark) {
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');
    
    if (isDark) {
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    } else {
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    }
}

// ====== 加載相簿數據 ======
async function loadAlbums() {
    try {
        const response = await fetch('src/albums.json');
        const data = await response.json();
        albumsData = data.albums;
        
        // 生成動態標籤按鈕
        if (data.categories) {
            renderHashtagFilters(data.categories);
        }
        
        renderAlbums('all');
    } catch (error) {
        console.error('加載相簿失敗:', error);
        document.getElementById('albumsGrid').innerHTML = '<p>加載相簿失敗，請稍後重試</p>';
    }
}

// ====== 生成動態標籤過濾按鈕 ======
function renderHashtagFilters(categories) {
    const filterContainer = document.getElementById('hashtagFilter');
    filterContainer.innerHTML = '';

    // 添加「全部」按鈕
    const allBtn = document.createElement('button');
    allBtn.className = 'hashtag-btn active';
    allBtn.textContent = '#全部';
    allBtn.dataset.filter = 'all';
    allBtn.addEventListener('click', () => {
        document.querySelectorAll('.hashtag-btn').forEach(btn => btn.classList.remove('active'));
        allBtn.classList.add('active');
        renderAlbums('all');
    });
    filterContainer.appendChild(allBtn);

    // 添加其他類別按鈕
    categories.forEach(category => {
        const btn = document.createElement('button');
        btn.className = 'hashtag-btn';
        btn.textContent = '#' + category;
        btn.dataset.filter = category;
        btn.addEventListener('click', () => {
            document.querySelectorAll('.hashtag-btn').forEach(btn => btn.classList.remove('active'));
            btn.classList.add('active');
            renderAlbums(category);
        });
        filterContainer.appendChild(btn);
    });
}

// ====== 渲染相簿 ======
function renderAlbums(filter) {
    currentFilter = filter;
    const gridContainer = document.getElementById('albumsGrid');
    gridContainer.innerHTML = '';

    let filteredAlbums = albumsData;

    if (filter !== 'all') {
        filteredAlbums = albumsData.filter(album => 
            album.categories.includes(filter)
        );
    }

    if (filteredAlbums.length === 0) {
        gridContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem;">暫無相簿</p>';
        return;
    }

    // 分離"街拍"和"風景"相簇（它們應該固定在第4、5位）
    const pinned = [];
    const regular = [];

    filteredAlbums.forEach(album => {
        if (album.categories.includes('街拍') || album.categories.includes('風景')) {
            pinned.push(album);
        } else {
            regular.push(album);
        }
    });

    // 只在全部相簇視圖時使用固定位置
    // 若篩選特定類別，則按原順序顯示
    let displayAlbums;
    if (filter === 'all' && pinned.length > 0) {
        // 在第4、5位插入固定相簇
        displayAlbums = [
            ...regular.slice(0, 3),           // 前3個常規相簇
            ...pinned.sort((a, b) => {        // 街拍和風景（內部按名稱排序）
                const aIsStreet = a.categories.includes('街拍') ? 0 : 1;
                const bIsStreet = b.categories.includes('街拍') ? 0 : 1;
                return aIsStreet - bIsStreet;
            }),
            ...regular.slice(3)               // 其餘常規相簇
        ];
    } else {
        displayAlbums = filteredAlbums;
    }

    displayAlbums.forEach(album => {
        const albumCard = createAlbumCard(album);
        gridContainer.appendChild(albumCard);
    });
}

// ====== 建立相簿卡片 ======
function createAlbumCard(album) {
    const card = document.createElement('div');
    card.className = 'album-card';
    card.onclick = () => openAlbumModal(album);

    const cover = document.createElement('img');
    cover.className = 'album-cover';
    cover.src = album.cover;
    cover.alt = album.title;
    cover.loading = 'lazy';

    const info = document.createElement('div');
    info.className = 'album-info';

    const title = document.createElement('div');
    title.className = 'album-title';
    title.textContent = album.title;

    const count = document.createElement('div');
    count.className = 'album-count';
    count.textContent = `${album.images.length} 張照片`;

    const tags = document.createElement('div');
    tags.className = 'album-tags';
    album.categories.forEach(cat => {
        const tag = document.createElement('span');
        tag.className = 'album-tag';
        tag.textContent = '#' + cat;
        tags.appendChild(tag);
    });

    info.appendChild(title);
    info.appendChild(count);
    info.appendChild(tags);
    card.appendChild(cover);
    card.appendChild(info);

    return card;
}

// ====== 打開相簫詳情 Modal ======
function openAlbumModal(album) {
    const modal = document.getElementById('albumModal');
    
    // 設定相簻標題
    document.getElementById('albumTitle').textContent = album.title;
    
    // Description 隱藏（保留欄位作為註記用）
    const descElement = document.getElementById('albumDescription');
    descElement.style.display = 'none';
    
    // 生成照片網格
    const gridContainer = document.getElementById('albumPhotosGrid');
    gridContainer.innerHTML = '';
    
    album.images.forEach((imagePath, index) => {
        const photoItem = document.createElement('div');
        photoItem.className = 'album-photo-item';
        
        const img = document.createElement('img');
        img.src = imagePath;
        img.alt = `${album.title} - 照片 ${index + 1}`;
        img.loading = 'lazy';
        
        // 點擊照片時打開放大 Modal
        photoItem.onclick = () => openImageFromAlbum(album.images, index);
        
        photoItem.appendChild(img);
        gridContainer.appendChild(photoItem);
    });
    
    modal.classList.add('show');
}

// ====== 從相簫中打開單張照片 ======
function openImageFromAlbum(images, index) {
    currentAlbumImages = images;
    currentImageIndex = index;
    showImageModal(index);
}

// ====== 圖片 Modal 控制 ======
function showImageModal(index) {
    if (currentAlbumImages.length === 0) return;

    currentImageIndex = (index + currentAlbumImages.length) % currentAlbumImages.length;
    const modal = document.getElementById('imageModal');
    const img = document.getElementById('modalImage');
    
    img.src = currentAlbumImages[currentImageIndex];
    document.getElementById('currentImageIndex').textContent = currentImageIndex + 1;
    document.getElementById('totalImages').textContent = currentAlbumImages.length;
    
    modal.classList.add('show');
}

function nextImage() {
    showImageModal(currentImageIndex + 1);
}

function previousImage() {
    showImageModal(currentImageIndex - 1);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
}

// ====== 事件監聽 ======
function setupEventListeners() {
    // 主題切換
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    // 置頂按鈕
    document.getElementById('topBtn').addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Modal 關閉按鈕
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            closeModal(modal.id);
        });
    });

    // 點擊 Modal 背景關閉
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });

    // 鍵盤導航
    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('imageModal');
        if (modal.classList.contains('show')) {
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') previousImage();
            if (e.key === 'Escape') closeModal('imageModal');
        }
    });
}

// ====== 圖片保護 ======
function preventImageProtection() {
    // 禁用右鍵菜單
    document.addEventListener('contextmenu', (e) => {
        if (e.target.tagName === 'IMG' || e.target.classList.contains('album-cover') || e.target.classList.contains('modal-image')) {
            e.preventDefault();
            return false;
        }
    });

    // 禁用拖拽
    document.addEventListener('dragstart', (e) => {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
            return false;
        }
    });

    // 禁用選取和複製
    document.addEventListener('selectstart', (e) => {
        if (e.target.tagName === 'IMG' || e.target.classList.contains('album-cover') || e.target.classList.contains('modal-image')) {
            e.preventDefault();
            return false;
        }
    });

    // 給所有圖片添加保護 CSS 類
    const mutationObserver = new MutationObserver(() => {
        document.querySelectorAll('img').forEach(img => {
            img.classList.add('protected-image');
        });
    });

    mutationObserver.observe(document.body, { subtree: true, childList: true });

    // 初始化已有的圖片
    document.querySelectorAll('img').forEach(img => {
        img.classList.add('protected-image');
    });
}

// ====== 工具函數 ======
function scrollToTop(e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
