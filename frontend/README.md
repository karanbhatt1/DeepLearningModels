# Citrus Classifier Frontend

A minimal static frontend to upload a citrus image and send it to the backend classifier.

## Run locally

Use any static file server from the `frontend` directory:

```bash
cd /workspace/frontend
python3 -m http.server 5173
```

Then open `http://localhost:5173`.

## Expected backend API

- Endpoint: `POST /api/classify`
- Request: `multipart/form-data` with field `image` containing the image file
- Response JSON (either of):
  - `{ "label": "orange", "confidence": 0.97 }`
  - `{ "prediction": { "label": "lemon", "confidence": 0.92 } }`

If your backend is hosted elsewhere, set up a reverse proxy or update `fetch('/api/classify', ...)` in `app.js` to the full URL.