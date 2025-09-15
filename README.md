# Candidate Profiler (PDF Upload Frontend)

A React + TypeScript + Vite app to upload a resume PDF and display parsed fields returned by the backend.

## Features

- Drag-and-drop or click-to-upload PDF.
- Uploads to `POST /pdf/upload` on the backend.
- Displays filename, size, mime type, and extracted fields including top skills.
- Dev proxy to avoid CORS in development.

## Requirements

- Node.js 18+
- Backend running locally on `http://localhost:3000` with endpoint `POST /pdf/upload` accepting multipart form-data field `file`.

## Getting Started

```bash
npm install
npm run dev
```

Open the app at http://localhost:5173, then drag a PDF into the drop area or click to choose a file. Click "Upload PDF" to send it to the backend.

## Backend API

- URL: `http://localhost:3000/pdf/upload`
- Method: `POST`
- Body: `multipart/form-data` with field name `file`
- Expected response shape:

```json
{
  "success": true,
  "data": {
    "fileName": "example.pdf",
    "fileSize": 12345,
    "mimeType": "application/pdf",
    "fields": {
      "full_name": "...",
      "college": "...",
      "most_recent_company": "...",
      "top_skills": ["..."]
    }
  }
}
```

If your backend uses a different field name than `file`, update the code in `src/App.tsx` where `FormData` is constructed.

## Dev Proxy

Vite is configured to proxy requests to `/pdf/*` to the backend:

```ts
// vite.config.ts
server: {
  proxy: {
    '/pdf': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
},
```

This means the frontend calls `/pdf/upload`, which is proxied to `http://localhost:3000/pdf/upload` in development.

## Build

```bash
npm run build
npm run preview
```

## Repository

Remote repo: https://github.com/TEJASVISJAIN/pdfparseFrontend.git

