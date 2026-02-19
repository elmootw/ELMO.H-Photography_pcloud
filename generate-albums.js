#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 自動掃描 public/images 文件夾並生成 albums.json
 * 
 * 文件夾命名規則（支援兩種格式）：
 *   1. N-title|categories (無 description)
 *   2. N-title|description|categories (有 description)
 * 
 * 也支援 albumN- 開頭：
 *   albumN-title|categories 或 albumN-title|description|categories
 * 
 * 例如：
 *   1-John & Emmie|情侶
 *   2-Johnny & Crystal|螢橋國中|情侶
 *   3-Jon & Pei|火車站|情侶,風景
 *   album4-Jonathan & Jennie|溫暖時刻|情侶
 * 
 * 每個相簿文件夾中應包含：
 *   - cover.jpg: 相簿封面（正方形）
 *   - photo-1.jpg, photo-2.jpg... 或其他末尾包含數字的照片
 * 
 * 使用方式：
 *   node generate-albums.js
 */

const imagesDir = path.join(__dirname, 'public', 'images');
const albumsJsonPath = path.join(__dirname, 'src', 'albums.json');

// ====== 讀取特殊文件夾（街拍和風景） ======
function readSpecialFolder(folderName) {
    const folderPath = path.join(imagesDir, folderName);
    
    if (!fs.existsSync(folderPath)) {
        return [];
    }
    
    const files = fs.readdirSync(folderPath);
    const photos = [];
    
    files.forEach(file => {
        const ext = path.extname(file).toLowerCase();
        const isImage = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
        
        if (isImage) {
            const relativePath = path.join('public/images', folderName, file).replace(/\\/g, '/');
            photos.push(relativePath);
        }
    });
    
    // 按檔名排序
    photos.sort();
    
    return photos;
}

// ====== 解析文件夾名稱 ======
function parseAlbumFolderName(folderName) {
    // 支援兩種格式：
    // 1. N-title|description|category1,category2 (有 description)
    // 2. N-title|category1,category2 (無 description)
    // 也支援 albumN- 開頭
    
    // 先移除 album 前綴（如果有）
    const normalizedName = folderName.replace(/^album/, '');
    
    // 分割字段
    const parts = normalizedName.split('|');
    
    if (parts.length < 2) {
        return null;
    }

    // 提取 ID 和 title
    const idMatch = parts[0].match(/^(\d+)-(.+)$/);
    if (!idMatch) {
        return null;
    }

    const id = parseInt(idMatch[1]);
    const title = idMatch[2].trim();

    let description = '';
    let categories = [];

    // 判斷字段數量
    if (parts.length === 2) {
        // 格式: N-title|categories (無 description，保持為空)
        description = '';
        categories = parts[1].split(',').map(cat => cat.trim()).filter(cat => cat);
    } else if (parts.length >= 3) {
        // 格式: N-title|description|categories (保持原樣，即使為空)
        description = parts[1].trim();
        categories = parts[2].split(',').map(cat => cat.trim()).filter(cat => cat);
    }

    return {
        id,
        title,
        description,
        categories
    };
}

// ====== 讀取相簿文件夾中的照片 ======
function readAlbumPhotos(albumPath, albumId) {
    const files = fs.readdirSync(albumPath);
    const photo = { cover: null, photos: [], debugInfo: [] };

    files.forEach(file => {
        const ext = path.extname(file).toLowerCase();
        const isImage = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);

        if (!isImage) {
            photo.debugInfo.push(`  ├─ ${file} (跳過: 非圖片格式)`);
            return;
        }

        const relativePath = path.join('public/images', path.basename(albumPath), file).replace(/\\/g, '/');

        // 檢查是否是封面
        const isCover = file.toLowerCase() === 'cover.jpg' || 
                        file.toLowerCase() === 'cover.png' || 
                        file.toLowerCase() === 'cover.webp';

        if (isCover) {
            photo.cover = relativePath;
            photo.debugInfo.push(`  ├─ ${file} (✓ 識別為封面)`);
        } else {
            // 支援多種格式：
            // 1. 01.jpg, 02.jpg (純數字)
            // 2. photo-1.jpg, photo-2.jpg (帶前綴的數字)
            // 3. img_01.jpg, image_1.jpg (各種前綴 + 數字)
            // 4. 1.jpg, photo1.jpg 等
            
            // 提取檔名（不含副檔名）
            const nameWithoutExt = path.basename(file, ext);
            
            // 尋找檔名中的數字序列（可以在檔名的任何位置）
            const photoMatch = nameWithoutExt.match(/(\d+)$/);  // 匹配末尾的數字
            
            if (photoMatch) {
                const photoNum = parseInt(photoMatch[1]);
                photo.photos.push({
                    num: photoNum,
                    path: relativePath
                });
                photo.debugInfo.push(`  ├─ ${file} (✓ 識別為照片 #${photoNum})`);
            } else {
                photo.debugInfo.push(`  ├─ ${file} (⚠️  跳過: 檔名末尾沒有數字，無法排序)`);
            }
        }
    });

    // 按數字序號排序照片
    photo.photos.sort((a, b) => a.num - b.num);

    return photo;
}

// ====== 主函數 ======
async function generateAlbums() {
    try {
        console.log('🔍 正在掃描目錄: ' + imagesDir);

        // 檢查文件夾是否存在
        if (!fs.existsSync(imagesDir)) {
            console.error('❌ 錯誤: 找不到 public/images 文件夾');
            process.exit(1);
        }

        // 读取街拍和風景特殊文件夾
        console.log('\n📂 讀取特殊文件夾...');
        const streetPhotos = readSpecialFolder('street');
        const landscapePhotos = readSpecialFolder('landscape');
        
        if (streetPhotos.length > 0) {
            console.log(`✓ 街拍: 找到 ${streetPhotos.length} 張照片`);
        }
        if (landscapePhotos.length > 0) {
            console.log(`✓ 風景: 找到 ${landscapePhotos.length} 張照片`);
        }

        // 讀取子文件夾
        const dirs = fs.readdirSync(imagesDir);
        const albumFolders = dirs.filter(dir => {
            // 排除 street 和 landscape 文件夾
            if (dir === 'street' || dir === 'landscape') {
                return false;
            }
            
            const fullPath = path.join(imagesDir, dir);
            return fs.statSync(fullPath).isDirectory();
        });

        if (albumFolders.length === 0 && streetPhotos.length === 0 && landscapePhotos.length === 0) {
            console.error('❌ 錯誤: 找不到任何相簌文件夾或特殊文件夾');
            console.log('   期望的格式:');
            console.log('     - N-標題|分類 (無 description)');
            console.log('     - N-標題|描述|分類 (有 description)');
            console.log('   或使用特殊文件夾:');
            console.log('     - public/images/street/');
            console.log('     - public/images/landscape/');
            process.exit(1);
        }

        // 解析所有相簿
        const albums = [];

        albumFolders.forEach(folderName => {
            const metadata = parseAlbumFolderName(folderName);

            if (!metadata) {
                console.warn(`⚠️  跳過: "${folderName}" (命名格式不符)`)
                return;
            }

            const albumPath = path.join(imagesDir, folderName);
            const photoData = readAlbumPhotos(albumPath, metadata.id);

            if (!photoData.cover) {
                console.warn(`⚠️  警告: 相簿 ${metadata.id} 找不到 cover.jpg`);
                console.log(`   文件夾: ${folderName}`);
                console.log(`   掃描結果:`);
                photoData.debugInfo.forEach(info => console.log(`   ${info}`));
                return;
            }

            if (photoData.photos.length === 0) {
                console.warn(`⚠️  警告: 相簿 ${metadata.id} 沒有照片`);
                console.log(`   文件夾: ${folderName}`);
                console.log(`   掃描結果:`);
                photoData.debugInfo.forEach(info => console.log(`   ${info}`));
                console.log(`   💡 提示: 照片命名應為檔名末尾包含數字，例如：`);
                console.log(`      ✓ photo-1.jpg、photo-2.jpg、photo-10.jpg`);
                console.log(`      ✓ 01.jpg、02.jpg、03.jpg`);
                console.log(`      ✓ img_1.jpg、image_001.jpg`);
                console.log(`      ✓ photo1.jpg、photo2.jpg`);
                console.log(`      ✗ photo.jpg、image.jpg (末尾沒有數字)`);
                return;
            }

            const imagesList = photoData.photos.map(p => p.path);

            albums.push({
                id: metadata.id,
                title: metadata.title,
                description: metadata.description,
                categories: metadata.categories,
                cover: photoData.cover,
                images: imagesList
            });
        });

        if (albums.length === 0) {
            console.error('❌ 錯誤: 沒有有效的相簿');
            process.exit(1);
        }

        // 按 ID 倒序排列
        albums.sort((a, b) => b.id - a.id);

        // 收集所有 categories（排除街拍和風景）
        const categoriesSet = new Set();
        albums.forEach(album => {
            album.categories.forEach(cat => {
                if (cat !== '街拍' && cat !== '風景') {
                    categoriesSet.add(cat);
                }
            });
        });

        // 預設的類別順序
        const categoryOrder = ['人像', '情侶', '登記', '婚宴', '活動'];
        
        // 按照預設順序排序，未在預設列表中的類別放在最後
        const categories = Array.from(categoriesSet).sort((a, b) => {
            const indexA = categoryOrder.indexOf(a);
            const indexB = categoryOrder.indexOf(b);
            if (indexA === -1 && indexB === -1) return a.localeCompare(b);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });

        // 生成 JSON
        const albumsJson = {
            categories: categories,
            specialFolders: {
                street: streetPhotos,
                landscape: landscapePhotos
            },
            albums: albums
        };

        // 寫入文件
        fs.writeFileSync(albumsJsonPath, JSON.stringify(albumsJson, null, 2), 'utf-8');

        // 輸出結果
        console.log('\n✅ 成功生成 albums.json!\n');
        console.log(`💾 已儲存至: ${albumsJsonPath}`);

    } catch (error) {
        console.error('❌ 發生錯誤:', error.message);
        process.exit(1);
    }
}

// ====== 執行 ======
generateAlbums();
