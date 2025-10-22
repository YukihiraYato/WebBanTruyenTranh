#!/bin/bash
set -e  # Dừng ngay nếu có lỗi

echo "🚀 Bắt đầu train model..."
python train_model.py

echo "✅ Train xong, khởi chạy FastAPI..."
uvicorn app:app --host 0.0.0.0 --port 8000
