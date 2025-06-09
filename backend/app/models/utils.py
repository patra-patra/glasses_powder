import sqlite3
import os
from backend.app.models.product import Product

DB_PATH = r"F:\PycharmProjects\glasses_powder\backend\app\db\products.db"

print("DB_PATH =", DB_PATH)
print("Файл существует?", os.path.exists(DB_PATH))
print("Абсолютный путь:", os.path.abspath(DB_PATH))

def get_all_products(): #для всех продуктов
    print("Exists DB file?", os.path.exists(DB_PATH))
    print("DB_PATH =", DB_PATH)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    cur.execute("SELECT * FROM products")
    rows = cur.fetchall()

    products = [Product(**dict(row)).to_dict() for row in rows]

    conn.close()
    return products


def get_products_by_type(types): #для типов продуктов (Женские, Мужские, Унисекс, Товары для лица, Товары для глаз, Товары для бровей, Товары для губ)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    cur.execute("SELECT * FROM products WHERE types = ?", (types,))
    rows = cur.fetchall()

    products = [Product(**dict(row)).to_dict() for row in rows]

    conn.close()
    return products

def get_filtered_products(brand=None, types=None, sort_by=None, search=None):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    query = "SELECT * FROM products WHERE 1=1"
    params = []

    #фильтрация
    if brand:
        query += " AND brand = ?"
        params.append(brand)

    if types:
        query += " AND types = ?"
        params.append(types)

    #поиск по name
    if search:
        query += " AND name LIKE ?"
        params.append(f"%{search}%")

    #сортировка
    if sort_by == "price_asc":
        query += " ORDER BY price ASC"
    elif sort_by == "price_desc":
        query += " ORDER BY price DESC"
    elif sort_by == "alpha_asc":
        query += " ORDER BY name ASC"
    elif sort_by == "alpha_desc":
        query += " ORDER BY name DESC"

    cur.execute(query, params)
    rows = cur.fetchall()
    conn.close()

    return [Product(**dict(row)).to_dict() for row in rows]