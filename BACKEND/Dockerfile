### Stage 1: Build dependencies ###
FROM python:3.11-slim AS builder

WORKDIR /app

# Install build dependencies (temporarily)
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    python3-dev \
    build-essential \
    --no-install-recommends

COPY requirements.txt .

# Install Python packages into /install
RUN pip install --prefix=/install --no-cache-dir -r requirements.txt


### Stage 2: Final lightweight image ###
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Copy only built Python packages
COPY --from=builder /install /usr/local

# Copy project code
COPY . .

EXPOSE 8000

CMD ["gunicorn", "backend_project.wsgi:application", "--bind", "0.0.0.0:8000"]
