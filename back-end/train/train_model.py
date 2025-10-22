import pandas as pd
from sqlalchemy import create_engine
from lightfm import LightFM
from lightfm.data import Dataset
import pickle
import re
import os

# =========================
# Kết nối MySQL
# =========================
engine = create_engine("mysql+pymysql://admin:admin@host.docker.internal:3306/bookstore")

# =========================
#  Lấy dữ liệu ratings
# =========================
ratings = pd.read_sql("""
                      SELECT user_id, item_id, rating
                      FROM user_book_ratings
                      """, engine)

ratings['user_id'] = ratings['user_id'].astype(int)
ratings['item_id'] = ratings['item_id'].astype(int)
ratings['rating']  = ratings['rating'].astype(float)

# =========================
#  Lấy dữ liệu books + category + genre
# =========================
books = pd.read_sql("""
                    SELECT b.book_id, c.category_name, b.genre
                    FROM books b
                             LEFT JOIN categories c ON b.category_id = c.category_id
                    """, engine)

# Bỏ record null
books = books.dropna(subset=['book_id', 'category_name', 'genre'])
books['book_id'] = books['book_id'].astype(int)

# =========================
#  Xử lý genre
# =========================
def split_genres(genre_str):
    genre_str = re.sub(r'[^\w, ]', '', str(genre_str))  # bỏ dấu chấm, ký tự lạ
    return [g.strip().lower() for g in genre_str.split(",") if g.strip()]

books['genres_list'] = books['genre'].apply(split_genres)

# Chuẩn hóa category
books['category_name'] = books['category_name'].str.lower().str.strip()

# =========================
#  Kết hợp category + genre thành feature
# =========================
def combined_features(row):
    return [f"{row.category_name}_{g}" for g in row.genres_list]

books['combined_features'] = books.apply(combined_features, axis=1)

# =========================
#  Chỉ giữ sách có rating
# =========================
valid_items = set(ratings['item_id']).intersection(set(books['book_id']))
ratings = ratings[ratings['item_id'].isin(valid_items)]
books = books[books['book_id'].isin(valid_items)]

# =========================
#  Tạo tập features cho LightFM
# =========================
all_features = set()
for row in books.itertuples():
    all_features.update(row.combined_features)

dataset = Dataset()
dataset.fit(
    users=ratings['user_id'].unique(),
    items=books['book_id'].unique(),
    item_features=list(all_features)
)

# =========================
#  Build item features matrix
# =========================
item_features_matrix = dataset.build_item_features(
    [(row.book_id, row.combined_features) for row in books.itertuples()]
)

# =========================
#  Build interactions
# =========================
interactions, weights = dataset.build_interactions(
    [(row.user_id, row.item_id, row.rating) for row in ratings.itertuples()]
)

# =========================
# Train LightFM model
# =========================
model = LightFM(loss='warp')
model.fit(interactions, item_features=item_features_matrix, epochs=20, num_threads=4)

# =========================
#  Save model
# =========================
os.makedirs('models', exist_ok=True)
with open('models/model.pkl', 'wb') as f:
    pickle.dump({
        'model': model,
        'dataset': dataset,
        'item_features': item_features_matrix
    }, f)

print(" Model đã lưu vào models/model.pkl")
