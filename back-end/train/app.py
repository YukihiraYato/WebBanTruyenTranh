from fastapi import FastAPI
import pickle
import numpy as np
import threading
import time
import subprocess

app = FastAPI()

# =========================
#  Hàm load model
# =========================
def load_model():
    global model, dataset, item_features, user_mapping, user_inv_mapping, item_mapping, item_inv_mapping
    with open("models/model.pkl", "rb") as f:
        data = pickle.load(f)
    model = data['model']
    dataset = data['dataset']
    item_features = data['item_features']
    user_mapping, user_inv_mapping, item_mapping, item_inv_mapping = dataset.mapping()
    print(" Model reloaded!")

# =========================
# Hàm retrain định kỳ
# =========================
def retrain_job():
    while True:
        print(" Retraining model...")
        subprocess.run(["python", "train_model.py"], check=True)
        load_model()
        print(" Retrain complete. Sleeping for 5 minutes...")
        time.sleep(5*60)  # 5p retrain 1 lần

# =========================
# 3 Chạy thread retrain song song khi app khởi động
# =========================
threading.Thread(target=retrain_job, daemon=True).start()

# =========================
#  Load model lần đầu
# =========================
load_model()

# =========================
#  API recommend
# =========================
@app.get("/recommend/{user_id}")
def recommend(user_id: int, k: int = 5):
    if user_id not in user_mapping:
        return {"error": f"User {user_id} not found in training data"}

    uid = user_mapping[user_id]
    n_items = len(item_mapping)
    scores = model.predict(uid, np.arange(n_items), item_features=item_features)
    top_items = np.argsort(-scores)[:k]

    recs = [int(item_inv_mapping[int(i)]) for i in top_items if int(i) in item_inv_mapping]

    return {
        "user_id": user_id,
        "recommendations": recs
    }
