# Docker Configuration Guide

## Overview
This project uses a multi-stage Docker build that serves both frontend and backend from a single container.

## Architecture
- **Backend**: FastAPI (Python) serving API on port 8000
- **Frontend**: Vite React build served as static files from `/app/static_frontend`
- **Database**: MongoDB in a separate container

## Environment Variables

### Frontend Build-time Variables (Vite)
These are injected during the Docker build process:

| Variable | Description | Docker Value | Local Dev Value |
|----------|-------------|--------------|-----------------|
| `VITE_API_URL` | API base URL for frontend | `""` (empty = same origin) | `http://localhost:8000` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID | From .env | From .env |

### Backend Runtime Variables
These are loaded from `./cashper_backend/.env` at runtime:

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for JWT token signing |
| `MAIL_*` | Email configuration for notifications |
| `GOOGLE_CLIENT_*` | Google OAuth credentials |

## Quick Start

### 1. Setup Environment Files

**Create `./cashper_backend/.env`:**
```env
MONGODB_URI=mongodb://mongo:27017/cashper
JWT_SECRET=your_super_secret_jwt_key
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

**Create root `.env` for build args:**
```env
VITE_API_URL=""
VITE_GOOGLE_CLIENT_ID=your_client_id
```

### 2. Build and Run

```bash
# Build (rebuilds frontend with VITE_API_URL)
docker-compose build --no-cache

# Start containers
docker-compose up -d

# View logs
docker-compose logs -f web
```

### 3. Access Application
- **Web App**: http://localhost:8080
- **MongoDB**: localhost:27017

## API URL Configuration

### Same-Origin Deployment (Default)
When frontend and backend are served from the same container:
```yaml
# docker-compose.yml
args:
  VITE_API_URL: ""  # Empty = uses relative URLs
```

Frontend will make calls like:
```javascript
fetch('/api/users')  // Same origin
```

### Separate API Domain
When API is on a different domain:
```yaml
# docker-compose.yml
args:
  VITE_API_URL: "https://api.example.com"
```

Frontend will make calls like:
```javascript
fetch('https://api.example.com/api/users')
```

## Local Development (Without Docker)

### Frontend
```bash
cd cashper_frontend
echo "VITE_API_URL=http://localhost:8000" > .env
npm install
npm run dev
```

### Backend
```bash
cd cashper_backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app:app --reload
```

## Rebuilding After Changes

If you change `VITE_API_URL`, you MUST rebuild:
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Troubleshooting

### API calls failing with 404
- Ensure `VITE_API_URL` is empty for same-origin deployment
- Rebuild with `--no-cache` if you changed the value

### CORS errors
- Check backend CORS configuration
- Ensure `VITE_API_URL` matches actual API origin

### Frontend not loading
- Check if `/app/static_frontend` exists in container
- Verify frontend build succeeded: `docker-compose logs web | grep frontend`
