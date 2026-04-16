# Dockerfile - production-ready, Python 3.12 slim
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system deps needed for psycopg2, Pillow, etc.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev gcc netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt /app/requirements.txt
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy project
COPY . /app/

# (Optional) collect static here if you want baked-in static files:
# RUN python manage.py collectstatic --noinput

# Create non-root user (optional)
RUN useradd -m -d /home/appuser appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Run Gunicorn
CMD ["gunicorn", "backend_ecommerce.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]
