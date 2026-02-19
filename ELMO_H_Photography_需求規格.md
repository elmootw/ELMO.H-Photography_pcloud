# ELMO.H Photography 作品集網站 — 專案需求規格

---

## 一、專案識別與品牌風格

- **網站標題**：ELMO.H Photography
- **整體視覺風格**：支援深色 / 淺色主題切換

---

## 二、技術棧與部署

| 項目 | 規格 |
|---|---|
| 核心技術 | HTML / CSS / JavaScript（純靜態前端） |
| 架站位置 | pCloud Public Folder |
| 響應式設計 | 必須具備 RWD（Responsive Web Design） |
| 檔案結構 | 採用現代前端結構（`src/`、`public/img/` 等） |
| 首頁 | index.html |

---

## 三、圖片來源與儲存方式

- 照片**不導向雲端相簿**
- 照片以**壓縮檔 + 浮水印**的方式預先處理，置於網站根目錄的對應路徑下

---

## 四、網站架構與導航

### 4.1 導覽列（Navigation Bar）

必須有完整導覽列，包含以下功能：

- 關於我 About Me（頁內錨點）
- 外站連結：
  - [https://elmootw.github.io](https://elmootw.github.io)
  - YouTube 連結：https://youtube.com/@elmoisfree?si=QRqSZypPOtPwYNC2
  - Instagram 連結：https://www.instagram.com/elmootw/
- 置頂按鈕
- 深色 / 淺色主題切換按鈕

### 4.2 相簿分類（Hashtag）

照簿分類以 hashtag 方式實現，類別如下：

`#人像` `#情侶` `#登記` `#婚宴` `#活動` `#風景` `#街拍` `#生活`

---

## 五、內容組織要求

| 項目 | 規格 |
|---|---|
| 動態內容彈性 | 需支援持續新增 / 刪除相簿或照片，每個相簿照片張數不固定 |
| 相簿封面縮圖 | 必須為**正方形**（1:1） |
| 照片顯示形狀 | 維持**原始比例**（橫幅或直幅均可，不強制裁切） |
| 相簿封面 | 每個相簿需要有獨立的封面縮圖 |

---

## 六、圖片處理與互動功能

| 功能 | 說明 |
|---|---|
| 圖片載入 | 必須採用 **Lazy Loading**（非同步載入） |
| 圖片展示 | 照片點擊後以 **Modal（Pop-out）** 方式放大顯示 |
| 安全保護 | 禁止複製 / 下載（禁用右鍵選單等下載途徑） |
