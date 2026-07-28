# Pull official lightweight Python base image
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Set working directory inside container
WORKDIR /app

# Install system dependencies (build-essential for Scikit-Learn/pandas if needed)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install python packages
COPY requirements.txt /app/
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy backend codebase to container
COPY . /app/

# Create media directory inside app container
RUN mkdir -p /app/media /app/static

# Collect Django static files
RUN python manage.py collectstatic --no-input

# Expose standard Django HTTP port
EXPOSE 8000

# Start production gunicorn wsgi runner
CMD exec gunicorn secureshield_core.wsgi:application --bind 0.0.0.0:$PORT --workers 3
