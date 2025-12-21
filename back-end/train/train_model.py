import pandas as pd
from sqlalchemy import create_engine
from lightfm import LightFM
from lightfm.data import Dataset
import pickle
import re
import os
import numpy as np

# =========================
# 🔗 Kết nối MySQL
# =========================
engine = create_engine("mysql+pymysql://admin:admin@host.docker.internal:3306/bookstore")

# =========================
# 📚 Lấy dữ liệu ratings mới nhất
# =========================
ratings = pd.read_sql("SELECT user_id, item_id, rating FROM user_book_ratings", engine)
ratings['user_id'] = ratings['user_id'].astype(int)
ratings['item_id'] = ratings['item_id'].astype(int)
ratings['rating'] = ratings['rating'].astype(float)

# Tạo dict user -> set(item_id)
user_rated_books = ratings.groupby('user_id')['item_id'].apply(set).to_dict()

# =========================
# 📖 Lấy dữ liệu books + category + genre
# =========================
books = pd.read_sql("""
                    SELECT b.book_id, c.category_name, b.genre
                    FROM books b
                             LEFT JOIN categories c ON b.category_id = c.category_id
                    """, engine)

books['book_id'] = books['book_id'].astype(int)
books['category_name'] = books['category_name'].fillna('unknown').str.lower().str.strip()
books['genre'] = books['genre'].fillna('')

# =========================
# 🧹 Làm sạch & tạo feature kết hợp
# =========================
def split_genres(genre_str):
    genre_str = re.sub(r'[^\w, ]', '', str(genre_str))
    return [g.strip().lower() for g in genre_str.split(",") if g.strip()]

books['genres_list'] = books['genre'].apply(split_genres)

def combined_features(row):
    if not row.genres_list:
        return [f"{row.category_name}_unknown"]
    return [f"{row.category_name}_{g}" for g in row.genres_list]

books['combined_features'] = books.apply(combined_features, axis=1)

# =========================
# 🧱 Dataset LightFM setup
# =========================
all_items = books['book_id'].unique()
all_users = ratings['user_id'].unique()

all_features = set()
for feats in books['combined_features']:
    all_features.update(feats)

dataset = Dataset()
dataset.fit(
    users=all_users,
    items=all_items,
    item_features=list(all_features)
)

# Build item_features cho toàn bộ sách
item_features_matrix = dataset.build_item_features(
    [(row.book_id, row.combined_features) for row in books.itertuples()]
)

# Build interactions
(interactions, weights) = dataset.build_interactions(
    [(row.user_id, row.item_id, row.rating) for row in ratings.itertuples()]
)

# =========================
# 🧠 Train LightFM model
# =========================
print("🚀 Bắt đầu train model...")
model = LightFM(loss='warp', random_state=42)
model.fit(interactions, item_features=item_features_matrix, epochs=20, num_threads=4)
print("✅ Train xong!")

# =========================
# 💾 Lưu model + dataset + interactions + user_rated_books
# =========================
os.makedirs('models', exist_ok=True)
with open('models/model.pkl', 'wb') as f:
    pickle.dump({
        'model': model,
        'dataset': dataset,
        'item_features': item_features_matrix,
        'interactions': interactions,
        'user_rated_books': user_rated_books
    }, f)

print("💾 Model đã lưu vào models/model.pkl")
print("Số lượng interactions:", interactions.getnnz())
print("Số lượng user_rated_books:", len(user_rated_books))
