# Use official Python base
FROM python:3.11-slim

# System dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    gdal-bin \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . /app

EXPOSE 8000

CMD ["bash", "-c", "python manage.py migrate && gunicorn myproject.wsgi:application --bind 0.0.0.0:8000"]
