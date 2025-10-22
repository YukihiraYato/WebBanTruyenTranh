# =========================
# 1️⃣ Base image
# =========================
FROM python:3.10-slim

# Set working dir
WORKDIR /app

# =========================
#  Install system dependencies
# =========================
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3-dev \
    libgomp1 \
    default-mysql-client \
    && rm -rf /var/lib/apt/lists/*

# =========================
# Copy requirements và cài Python libs
# =========================
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# =========================
#  Copy source code vào container
# =========================
COPY . .

# =========================
# Create folder model
# =========================
RUN mkdir -p models

# =========================
#  Copy start script
# =========================
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# =========================
#  Expose port và khởi động
# =========================
EXPOSE 8000
CMD ["./start.sh"]