# Parts Diagram Full-Stack App

Full-stack web app with:
- **Frontend:** Next.js (React functional components + TypeScript)
- **Backend:** Node.js + Express
- Viewer page with responsive diagram + clickable hotspots + parts table
- Admin dashboard to upload a new diagram image and create hotspots

## Project Structure

- `frontend/` Next.js app
  - `/` viewer page
  - `/admin` admin dashboard page
- `backend/` Express API server
- `frontend/public/diagram.svg` default fallback diagram image

## Backend API

### Viewer APIs

- `GET /api/diagram`
  - Returns `{ "imagePath": string | null }`
- `GET /api/hotspots`
  - Returns all hotspots
- `GET /api/parts`
  - Returns all parts (for admin dropdown)
- `GET /api/parts/:partId`
  - Returns one part

### Admin APIs

- `POST /api/admin/diagram-image`
  - `multipart/form-data`
  - Field name: `image`
  - Saves file to `backend/uploads`
  - Returns `{ "imagePath": "/uploads/<filename>" }`
- `POST /api/admin/hotspots`
  - JSON body:

```json
{
  "label": "6",
  "x": 0.42,
  "y": 0.33,
  "width": 0.1,
  "height": 0.14,
  "partId": "part-101"
}
```

## Run Locally

### 1) Start backend

```bash
cd /Users/vishnuprasadkuntar/Documents/sparelab-epc/backend
npm install
npm run dev
```

Backend runs on `http://localhost:4000`.

### 2) Start frontend

```bash
cd /Users/vishnuprasadkuntar/Documents/sparelab-epc/frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`.

The frontend calls backend at `http://localhost:4000` by default. To change it:

```bash
NEXT_PUBLIC_API_BASE_URL=http://your-host:port
```

## Usage

1. Open `http://localhost:3000/admin`.
2. Upload a diagram image.
3. Click on the image to place a hotspot coordinate.
4. Set label/part/width/height and create hotspot.
5. Open `http://localhost:3000` to verify hotspot selection and parts table behavior.

## Notes

- Data is in-memory. Restarting backend resets hotspot list and current diagram image path.
- Uploaded files remain in `backend/uploads` unless removed manually.
