from fastapi import FastAPI
import pickle
import numpy as np
import threading
import time
import subprocess
import os
import pandas as pd
from sqlalchemy import create_engine

app = FastAPI()

# =========================
# 🔗 Kết nối MySQL
# =========================
engine = create_engine("mysql+pymysql://admin:admin@host.docker.internal:3306/bookstore")

# =========================
# 1️⃣ Hàm load model từ pickle
# =========================
def load_model():
    global model, dataset, item_features, user_mapping, user_inv_mapping, item_mapping, item_inv_mapping, interactions, user_rated_books
    with open("models/model.pkl", "rb") as f:
        data = pickle.load(f)
    model = data['model']
    dataset = data['dataset']
    item_features = data['item_features']
    interactions = data['interactions']
    user_rated_books = data['user_rated_books']
    user_mapping, user_inv_mapping, item_mapping, item_inv_mapping = dataset.mapping()
    print(f"✅ Model loaded! Users={len(user_mapping)}, Items={len(item_mapping)}, user_rated_books={len(user_rated_books)}")

# =========================
# 2️⃣ Hàm retrain tự động 2 phút
# =========================
def retrain_job():
    while True:
        print("🔁 Retraining model...")
        try:
            subprocess.run(["python", "train_model.py"], check=True)
            load_model()  # reload model mới vào app
            print("✅ Retrain complete. Sleeping 2 minutes...\n")
        except Exception as e:
            print("❌ Retrain failed:", e)
        time.sleep(2 * 60)

threading.Thread(target=retrain_job, daemon=True).start()

# =========================
# 3️⃣ Load model lần đầu
# =========================
if os.path.exists("models/model.pkl"):
    load_model()
else:
    print("⚠️ model.pkl chưa tồn tại, chạy train_model.py trước")

# =========================
# 4️⃣ API recommend
# =========================
@app.get("/recommend/{user_id}")
def recommend(user_id: int, k: int = 10):
    if user_id not in user_mapping:
        return {"error": f"User {user_id} not found in training data"}

    uid = user_mapping[user_id]
    n_items = len(item_mapping)

    # Tính score với model
    scores = model.predict(uid, np.arange(n_items), item_features=item_features)

    # Lấy sách user đã đánh giá **realtime** từ DB
    df = pd.read_sql(f"SELECT item_id FROM user_book_ratings WHERE user_id={user_id}", engine)
    known_item_ids = set(df['item_id'].astype(int))

    # Chọn top K sách chưa đánh giá
    top_items = np.argsort(-scores)
    recs = []
    for i in top_items:
        real_id = item_inv_mapping.get(int(i))
        if real_id is None or real_id in known_item_ids:
            continue
        recs.append(real_id)
        if len(recs) >= k:
            break

    print(f"🔎 Recommend user {user_id}: {recs}")
    return {"user_id": user_id, "recommendations": recs}
