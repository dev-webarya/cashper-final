# Stage 1: Build the Frontend
FROM node:20-alpine as frontend-build

WORKDIR /frontend

# Copy frontend source
COPY cashper_frontend/package*.json ./
RUN npm install

COPY cashper_frontend/ .

# Inject API URL during build to prevent double /api issue
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: Setup Backend and Serve
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements
COPY cashper_backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY cashper_backend/ .

# Copy built frontend assets to backend directory
# We place it in 'static_frontend' which app/__init__.py checks for
COPY --from=frontend-build /frontend/dist /app/static_frontend

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
