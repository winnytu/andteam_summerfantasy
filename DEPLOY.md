# Google Cloud 部署指南

The Way to You: Summer Fantasy（Vite + React 靜態網站）

本專案建置後輸出至 `dist/`，沒有後端 API。以下提供兩種 Google Cloud 部署方式：

| 方式 | 適合情境 | 難度 |
|------|----------|------|
| [Firebase Hosting](#方式一firebase-hosting推薦) | 個人專案、快速上線、自訂網域 | ⭐ 簡單 |
| [Cloud Run](#方式二cloud-run) | 想用容器、或未來可能加 API | ⭐⭐ 中等 |

---

## 前置準備

### 1. 安裝工具

```bash
# Node.js 18 以上（建議 20 LTS）
node -v

# Google Cloud CLI
# https://cloud.google.com/sdk/docs/install
gcloud --version

# Firebase CLI（方式一需要）
npm install -g firebase-tools
firebase --version
```

### 2. 建立 GCP 專案

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案（例如 `andteam-summer-fantasy`）
3. 記下 **Project ID**

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

### 3. 本地建置確認

在 `andteam/` 目錄執行：

```bash
cd andteam
npm install
npm run build
npm run preview   # 開 http://localhost:4173 確認畫面正常
```

建置成功後，`dist/` 內應有 `index.html`、`assets/` 等檔案。

---

## 方式一：Firebase Hosting（推薦）

Firebase Hosting 屬於 Google Cloud 生態，免費額度足夠個人 fan project 使用，且已設定 SPA 路由 fallback。

### 初次設定

```bash
cd andteam

# 登入 Google 帳號
firebase login

# 複製專案設定範本並填入你的 Project ID
cp .firebaserc.example .firebaserc
# 編輯 .firebaserc，將 YOUR_PROJECT_ID 改成實際 ID
```

`.firebaserc` 範例：

```json
{
  "projects": {
    "default": "your-gcp-project-id"
  }
}
```

若 GCP 專案尚未啟用 Firebase：

1. 開啟 [Firebase Console](https://console.firebase.google.com/)
2. 選「新增專案」→ 選擇既有 GCP 專案
3. 在專案中啟用 **Hosting**

### 部署

```bash
npm run build
firebase deploy --only hosting
```

完成後終端機會顯示網址，例如：

```
Hosting URL: https://your-project-id.web.app
```

### 自訂網域（選用）

1. Firebase Console → Hosting → 新增自訂網域
2. 依指示在 DNS 新增 TXT / A 記錄

### 更新網站

每次改完程式：

```bash
npm run build
firebase deploy --only hosting
```

---

## 方式二：Cloud Run

以 Nginx 容器提供 `dist/` 靜態檔，適合已熟悉 Docker 或之後要擴充後端的流程。

### 初次設定

```bash
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com

# 建立 Artifact Registry（只需一次）
gcloud artifacts repositories create andteam \
  --repository-format=docker \
  --location=asia-east1 \
  --description="andteam static site"
```

### 手動部署

```bash
cd andteam
npm run build

# 建置並推送映像（將 YOUR_PROJECT_ID 換成你的 ID）
gcloud builds submit --tag asia-east1-docker.pkg.dev/YOUR_PROJECT_ID/andteam/site:latest

# 部署到 Cloud Run
gcloud run deploy andteam-site \
  --image asia-east1-docker.pkg.dev/YOUR_PROJECT_ID/andteam/site:latest \
  --region asia-east1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080
```

部署完成後會得到 `https://andteam-site-xxxxx.asia-east1.run.app` 這類網址。

### 使用 cloudbuild.yaml（選用）

已附 `cloudbuild.yaml`，可在 Cloud Build 觸發自動建置：

```bash
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_REGION=asia-east1,_SERVICE=andteam-site
```

需在 Cloud Build 設定中替換 `_PROJECT_ID` 或使用預設專案。

### 更新網站

```bash
npm run build
gcloud builds submit --tag asia-east1-docker.pkg.dev/YOUR_PROJECT_ID/andteam/site:latest
gcloud run deploy andteam-site \
  --image asia-east1-docker.pkg.dev/YOUR_PROJECT_ID/andteam/site:latest \
  --region asia-east1
```

---

## 方式三：Cloud Storage + CDN（進階）

若只要純靜態、不用 Firebase / Cloud Run，可將 `dist/` 上傳至 GCS 並搭配 Load Balancer + Cloud CDN。設定步驟較多，一般 fan project 建議優先使用 Firebase Hosting。

概要：

1. 建立 bucket：`gs://YOUR_BUCKET_NAME`
2. 上傳：`gsutil -m rsync -r -d dist gs://YOUR_BUCKET_NAME`
3. 設定 bucket 為網站主機（index: `index.html`）
4. 透過 Load Balancer 綁定自訂網域並啟用 CDN

詳細步驟見 [Google 官方文件：靜態網站託管](https://cloud.google.com/storage/docs/hosting-static-website)。

---

## 環境與建置注意事項

### Node 版本

建議使用 Node.js **18** 或 **20**。若 Cloud Build 建置失敗，可在 `cloudbuild.yaml` 或 Dockerfile 中指定 Node 版本。

### 資源路徑

專案使用 Vite 預設 `base: '/'`，部署在網域根路徑即可。若需部署在子路徑（例如 `/game/`），需在 `vite.config.js` 設定：

```js
export default defineConfig({
  base: '/game/',
  // ...
})
```

### 快取

- `firebase.json` 已為 JS/CSS/圖片/音訊設定長快取
- 更新部署後若看不到新畫面，可強制重新整理（Ctrl+Shift+R）或清除快取

### 音訊自動播放

瀏覽器可能阻擋自動播放；CatchGame 已有「Tap to Play」fallback，部署後行為與本地一致。

### 測試用 K 鍵

Mission 1–3 可按 `K` 跳關（僅方便測試）。正式上線前若不想暴露，可再移除各遊戲元件內的 skip 監聽。

---

## 常見問題

### `firebase deploy` 找不到專案

確認 `.firebaserc` 的 Project ID 與 Firebase Console 一致，且已啟用 Hosting。

### Cloud Run 部署後 404

確認建置前有執行 `npm run build`，且 Docker 映像有 COPY `dist/`（見專案根目錄 `Dockerfile`）。

### 圖片或音樂載入失敗

確認 `npm run build` 成功，且 `dist/assets/` 內有對應檔案。檔名含空格（如 ` PartyPopper.png`）已在原始碼 import，建置後會自動 hash 重新命名。

### 建置記憶體不足

```bash
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

---

## 檔案說明

| 檔案 | 用途 |
|------|------|
| `firebase.json` | Firebase Hosting 設定（public、SPA rewrite、快取） |
| `.firebaserc.example` | Firebase 專案 ID 範本 |
| `Dockerfile` | Cloud Run 用 Nginx 靜態服務 |
| `nginx.conf` | SPA fallback、gzip |
| `cloudbuild.yaml` | Cloud Build 一鍵建置 + 部署 Cloud Run |
| `.dockerignore` | 縮小 Docker build context |

---

## 快速指令對照

```bash
# 本地
npm run dev          # 開發
npm run build        # 建置
npm run preview      # 預覽 dist

# Firebase Hosting
firebase deploy --only hosting

# Cloud Run（替換 YOUR_PROJECT_ID）
npm run build
gcloud builds submit --tag asia-east1-docker.pkg.dev/YOUR_PROJECT_ID/andteam/site:latest
gcloud run deploy andteam-site --image asia-east1-docker.pkg.dev/YOUR_PROJECT_ID/andteam/site:latest --region asia-east1 --allow-unauthenticated
```
