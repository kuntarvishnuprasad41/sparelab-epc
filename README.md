# Garage EPC + Job Card (Next.js + Express)

This project now supports a practical garage workflow:

- EPC diagram with **multi-select hotspots**
- Part search with **availability** and **turnaround time**
- **Add to cart** from EPC selections
- **Job card creation** using cart items
- RC image upload with mock OCR extraction for vehicle details
- Service/labor line costing and bill totals
- Job card lifecycle status updates and dashboard metrics
- Admin page for diagram upload and hotspot creation

## Apps

- Frontend: `/Users/vishnuprasadkuntar/Documents/sparelab-epc/frontend`
- Backend: `/Users/vishnuprasadkuntar/Documents/sparelab-epc/backend`

## Frontend Routes

- `http://localhost:3000/`
  - EPC screen
  - hotspot multi-select
  - selected parts table with availability/TAT
  - alternatives/supersession lookup
  - add selected to cart
- `http://localhost:3000/job-cards/new`
  - RC extraction
  - customer + vehicle details
  - service/labor costing
  - EPC cart part embedding
  - job card creation
  - status dashboard and customer history
- `http://localhost:3000/admin`
  - upload diagram image
  - create hotspots

## Backend APIs

### EPC + Parts

- `GET /api/diagram`
- `GET /api/hotspots`
- `GET /api/parts?query=<text>`
- `GET /api/parts/:partId`
- `GET /api/parts/:partId/alternatives`
- `GET /api/services`

### Admin

- `POST /api/admin/diagram-image` (multipart, field: `image`)
- `POST /api/admin/hotspots`

### Job Cards + RC

- `POST /api/ocr/rc` (multipart, field: `rcImage`) - mock extraction
- `GET /api/job-cards/statuses`
- `GET /api/job-cards/metrics`
- `GET /api/job-cards?customerPhone=<phone>`
- `GET /api/job-cards/:jobCardId`
- `POST /api/job-cards`
- `PATCH /api/job-cards/:jobCardId/status`

## Run Locally

### 1) Backend

```bash
cd /Users/vishnuprasadkuntar/Documents/sparelab-epc/backend
npm install
npm run dev
```

Runs on `http://localhost:4000`.

### 2) Frontend

```bash
cd /Users/vishnuprasadkuntar/Documents/sparelab-epc/frontend
npm install
npm run dev
```

Runs on `http://localhost:3000`.

If backend host is different:

```bash
NEXT_PUBLIC_API_BASE_URL=http://your-backend-host:4000
```

## Notes

- Data is in-memory for hotspots/job cards/metrics.
- Uploaded files are saved in `/Users/vishnuprasadkuntar/Documents/sparelab-epc/backend/uploads`.
- Cart is persisted in browser localStorage.
