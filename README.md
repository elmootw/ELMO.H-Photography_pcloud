# ELMO.H Photography 作品集網站 — 使用指南

## 📁 項目結構

```
Public Folder/
├── index.html                          # 主頁面
├── generate-albums.js                  # 自動生成 JSON 腳本（Node.js）
├── src/
│   ├── styles.css                      # 樣式表（含深色/淺色主題）
│   ├── app.js                          # JavaScript 邏輯
│   └── albums.json                     # 相簡數據配置（自動生成）
├── public/
│   └── images/                         # 照片資料夾
│       ├── street/                     # 街拍照片（獨立管理）
│       │   ├── photo-1.jpg
│       │   ├── photo-2.jpg
│       │   └── ...
│       ├── landscape/                  # 風景照片（獨立管理）
│       │   ├── photo-1.jpg
│       │   ├── photo-2.jpg
│       │   └── ...
│       ├── 1-John & Emmie|情侶/       # 普通相簡
│       │   ├── cover.jpg               # 相簡封面（正方形）
│       │   ├── photo-1.jpg
│       │   ├── photo-2.jpg
│       │   └── ...
│       ├── 2-Johnny & Crystal|螢橋國中|情侶/
│       │   ├── cover.jpg
│       │   ├── photo-1.jpg
│       │   └── ...
│       └── ...
├── README.md                           # 本文件
└── ELMO_H_Photography_需求規格.md     # 原始需求規格
```

## 🚀 快速開始

1. 確保所有文件已上傳到 pCloud Public Folder
2. 在瀏覽器中打開 `index.html`
3. 網站會自動從 `src/albums.json` 加載相簡數據
4. 點擊導覽列的**街拍**或**風景**連結查看特殊分頁

## 📷 添加相簡與照片步驟

### 📌 重要：街拍和風景的特殊處理

**街拍** 和 **風景** 與其他相簡不同：
- 它們是**連續更新**的內容（不像婚禮一次性相簡）
- 照片存放在**獨立文件夾**（不分相簡）
- 網站有**獨立分頁**展示，採用 Pinterest 風格布局（Masonry）

### 🎯 添加普通相簡（人像、情侶、婚禮、活動等）

#### 第1步：準備照片
- 所有照片需要**預先壓縮**並加上**浮水印**
- 相簡**封面必須是正方形**（1:1 比例）
  - 建議尺寸：600×600px 或更大
  - **檔名必須是 `cover.jpg`** 或 `cover.png`、`cover.webp`
- 其他照片維持**原始比例**（橫幅或直幅均可）
  - 建議寬度：1200px 以上
  - **檔名末尾必須包含數字**（用來排序照片）
    - 例如：`photo-1.jpg`、`photo-2.jpg`、`01.jpg`、`img_1.jpg` 等

#### 第2步：建立相簡文件夾
在 `public/images/` 中建立子文件夾，**文件夾名稱格式**（支援兩種）：

**格式 A - 有描述**（推薦）：
```
N-title|description|category1,category2
```

**格式 B - 無描述**：
```
N-title|category1,category2
```

**參數說明**：
- `N` = 相簡編號（數字，決定排序順序）
- `title` = 相簡標題
- `description` = 相簡描述（**可選，不填則為空值**）
- `category1,category2` = 分類標籤（多個用逗號分隔）

**示例**：
```
1-John & Emmie|情侶                                    (無描述)
2-Johnny & Crystal|螢橋國中|情侶                      (有描述)
3-Fine Art|他們的細膩互動|情侶,生活
10-Jonathan & Jennie|溫暖的擁抱|情侶
```

#### 第3步：上傳照片到相簡文件夾

完整結構示例：
```
public/images/
├── 1-John & Emmie|情侶/
│   ├── cover.jpg     # 相簡封面
│   ├── photo-1.jpg   # 照片 (末尾有數字1)
│   ├── photo-2.jpg   # 照片 (末尾有數字2)
│   └── photo-3.jpg   # 照片 (末尾有數字3)
├── 2-Johnny & Crystal|螢橋國中|情侶/
│   ├── cover.jpg
│   ├── 01.jpg        # 也支持這種格式
│   ├── 02.jpg
│   └── 03.jpg
└── ...
```

### 🌆 添加街拍/風景照片

**不需要** cover.jpg，直接上傳照片到 `street/` 或 `landscape/` 文件夾：

```
public/images/
├── street/
│   ├── photo-1.jpg
│   ├── photo-2.jpg
│   ├── photo-3.jpg
│   └── ...（任意數量）
├── landscape/
│   ├── photo-1.jpg
│   ├── photo-2.jpg
│   └── ...（任意數量）
```

**特點**：
- 照片按文件名自動排序
- 無需 cover.jpg
- 無需分類標籤
- 每當添加新照片，重新運行腳本即可更新
- 網站首頁的**導覽列**有獨立連結通向街拍和風景分頁
- 採用 Masonry 布局（如 Pinterest），自動適應不同寬高比

### 第4步：運行自動生成腳本（推薦）

在項目根目錄運行：

```bash
node generate-albums.js
```

**功能**：
- ✅ 自動掃描 `public/images/` 所有子文件夾（普通相簡）
- ✅ 自動掃描 `street/` 和 `landscape/` 文件夾中的照片
- ✅ 根據**文件夾名稱**自動識別相簡的 title、description、categories
- ✅ 自動掃描每個文件夾中的照片
- ✅ 自動生成 `src/albums.json`（包含 `specialFolders` 結構）
- ✅ 普通相簡按編號**倒序排列**（編號大的在前，新作品最靠前）
- ✅ **提取所有分類標籤**，動態生成相簡篩選按鈕（無需手工維護）

**前提**：
- 已安裝 Node.js（v12 或以上）
- 分類標籤**無預設限制**，可以自訂任何標籤
  - 腳本會自動收集所有分類並動態生成到 `categories` 數組
  - 排序時預設優先級為：`人像` → `情侶` → `登記` → `婚宴` → `活動`
  - 未預設的分類會排在最後
  - （街拍和風景會自動排除，因為它們有獨立分頁）

### 第5步：刷新頁面
相簡和照片會自動顯示在網站上。街拍和風景照片會顯示在各自的分頁中。

## 🎨 主題系統

網站支援**深色/淺色主題自動切換**：
- 用戶選擇偏好後自動保存到瀏覽器（localStorage）
- 下次訪問會記住用戶的選擇

## 🔐 圖片保護功能

已實現的保護措施：
- ✅ 禁用**右鍵菜單**
- ✅ 禁用**拖拽下載**
- ✅ 禁用**文本選取和複製**
- ✅ 所有圖片添加 CSS 保護類別
- ✅ Modal 中的圖片也受保護

## 📱 響應式設計

- ✅ 完全支持 Mobile（手機）
- ✅ Tablet（平板）
- ✅ Desktop（桌面）
- ✅ 自動調整佈局和圖片大小
- ✅ 街拍/風景分頁採用 Masonry 布局（4欄桌面、3欄平板、1欄手機）

## 🖼️ 圖片加載優化

- ✅ **Lazy Loading**：圖片按需加載
- ✅ **Modal 放大**：點擊相簡照片立即放大顯示
- ✅ **Masonry 布局**：街拍和風景分頁自動調整版面（Pinterest 風格）
- ✅ **鍵盤導航**：
  - `←` / `→` 切換照片
  - `ESC` 關閉 Modal
  - 支持在街拍/風景分頁瀏覽時鍵盤瀏覽

## 📊 相簡數據格式參考

自動生成的 `albums.json` 格式示例：

```json
{
  "categories": ["人像", "情侶", "婚宴", "登記", "活動"],
  "specialFolders": {
    "street": [
      "public/images/street/photo-1.jpg",
      "public/images/street/photo-2.jpg",
      "public/images/street/photo-3.jpg"
    ],
    "landscape": [
      "public/images/landscape/photo-1.jpg",
      "public/images/landscape/photo-2.jpg"
    ]
  },
  "albums": [
    {
      "id": 10,
      "title": "細水長流",
      "description": "一對新人在陽光下溫暖相擁",
      "categories": ["情侶"],
      "cover": "public/images/10-細水長流|..../cover.jpg",
      "images": [
        "public/images/10-細水長流|..../photo-1.jpg",
        "public/images/10-細水長流|..../photo-2.jpg",
        "public/images/10-細水長流|..../photo-3.jpg"
      ]
    }
  ]
}
```

**關鍵說明**：
- `categories`: 動態提取的所有分類標籤（對應相簡篩選按鈕）
- `specialFolders`: 街拍和風景的特殊結構（獨立分頁數據）
- `albums`: 普通相簡數組（按 `id` 倒序排列，新作品在前）

## 🔧 自訂修改

### 修改品牌標題
編輯 `index.html`：
```html
<h1 class="navbar-logo">您的標題</h1>
```

### 修改主題顏色
編輯 `src/styles.css` 中的 CSS 變數：
```css
:root {
    --bg-primary: #FFFFFF;
    --text-primary: #1a1a1a;
    /* 其他顏色... */
}
```

### 修改社群連結
編輯 `index.html` 中的導覽列：
```html
<a href="您的連結" target="_blank" class="social-icon">標籤</a>
```

## 📝 常見問題

**Q：街拍和風景用獨立文件夾的好處是什麼？**  
A：因為街拍和風景是連續更新的內容（不像婚禮相簡一次性拍攝），獨立管理避免了與其他相簡混淆。新增照片只需複製到對應文件夾再重新生成一次即可。而且有獨立分頁展示，採用 Masonry 布局，視覺效果更好。

**Q：為什麼要用文件夾名稱來定義相簡信息？**  
A：這樣可以避免手動編輯 JSON，所有信息直觀地顯示在文件夾名稱中，新增或刪除相簡非常方便。

**Q：相簡會按什麼順序顯示？**  
A：相簡按編號**倒序排列**（編號大的在前），這樣新相簡自動顯示在最前面。編號是文件夾名稱中 `N-title` 的 `N` 部分。

**Q：description 一定要填嗎？**  
A：不一定，支援兩種格式，如果沒有描述可以省略：
- 無 description：`1-John & Emmie|情侶`（description 為空值）
- 有 description：`2-Johnny & Crystal|螢橋國中|情侶`

系統**不會自動命名** description，您不填就為空。

**Q：我該怎麼添加新普通相簡？**  
A：
1. 在 `public/images/` 中建立文件夾
2. 文件夾名稱格式：`N-title|categories` 或 `N-title|description|categories`
3. 想要新相簡在最前面？使用更大的 N 值
4. 將相簡照片放入文件夾（cover.jpg 和 photo-1.jpg 等）
5. 運行 `node generate-albums.js`
6. 刷新網站

**Q：我該怎麼添加街拍或風景照片？**  
A：
1. 直接複製照片到 `public/images/street/` 或 `public/images/landscape/`
2. 無需創建 cover.jpg，直接放照片即可
3. 無需添加分類標籤
4. 運行 `node generate-albums.js`
5. 刷新網站，街拍和風景分頁會自動更新

**Q：照片文件名有什麼要求？**  
A：
- **普通相簡封面**：必須是 `cover.jpg`（或 `cover.png`、`cover.webp`）
- **普通相簡照片**：檔名**末尾必須包含數字**，用來排序照片
  - ✅ 支持：`photo-1.jpg`、`photo-2.jpg`、`01.jpg`、`02.jpg` 等
  - ❌ 不支持：`photo.jpg`（末尾沒有數字）
- **街拍/風景照片**：任何名稱皆可（自動按文件名排序）

**Q：分類標籤可以自訂嗎？**  
A：是的，完全可以。分類標籤**無預設限制**，可以使用任何分類。腳本會根據相簡文件夾中的標籤自動生成 `categories` 數組。

排序時有預設的優先級：`人像` → `情侶` → `登記` → `婚宴` → `活動`，這些分類會排在前面；其他自訂分類會排在最後。但無論如何，所有分類都會被收集並展示。

**Q：為什麼街拍和風景有獨立分頁？**  
A：因為街拍和風景是連續更新的內容，獨立分頁設計能更好地展示，採用 Masonry 布局視覺效果更優。

## ✨ 功能清單

- ✅ 響應式網頁設計（RWD）
- ✅ 深色/淺色主題切換
- ✅ 動態相簡加載（JSON 配置）
- ✅ 動態分類標籤篩選（無預設限制，自動從相簡生成）
- ✅ 街拍和風景獨立分頁（Masonry 布局）
- ✅ Lazy Loading（圖片分阶加載）
- ✅ Modal 放大顯示
- ✅ 鍵盤導航支持
- ✅ 圖片防保護（禁右鍵、禁拖拽、禁複製）
- ✅ 社群連結整合
- ✅ 流暢過渡動畫

## 📞 技術棧

- **HTML5** - 語義化結構
- **CSS3** - 現代樣式（Grid、Flexbox、Columns Masonry）
- **Vanilla JavaScript** - 無框架依賴
- **JSON** - 數據管理
- **Node.js** - 自動化腳本

---

最後更新：2026年2月19日（包含街拍/風景獨立分頁功能）
