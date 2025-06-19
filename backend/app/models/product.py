import os

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Product(db.Model):
    __tablename__ = "products"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    price = db.Column(db.Float, nullable=False)
    types = db.Column(db.String)
    material = db.Column(db.String)
    brand = db.Column(db.String)
    country = db.Column(db.String)
    color = db.Column(db.String)
    url = db.Column(db.String)
    photonum = db.Column(db.String)
    desc = db.Column(db.String, default="no")
    massa = db.Column(db.String, default="no")
    struct = db.Column(db.String, default="no")
    use = db.Column(db.String, default="no")

    def to_dict(self):
        return {
            key: value
            for key, value in self.__dict__.items()
            if not key.startswith("_") and value not in ("no", "", None)
        }

class User(db.Model):
    __tablename__ = "user"

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String, nullable=False)
    last_name = db.Column(db.String, nullable=False)
    phone = db.Column(db.String, unique=True, nullable=False)
    email = db.Column(db.String, unique=True)
    password = db.Column(db.String, nullable=False)  # убедимся, что обязательное поле
    birthdate = db.Column(db.String)
    gender = db.Column(db.String)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    orders = db.relationship("Order", back_populates="user")

class UserDeliveryAddress(db.Model):
    __tablename__ = "user_delivery_addresses"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    city = db.Column(db.String, nullable=False)
    street = db.Column(db.String, nullable=False)
    postal_code = db.Column(db.String(20))

    user = db.relationship("User", backref="delivery_addresses")

class Order(db.Model):
    __tablename__ = "orders"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    delivery_address_id = db.Column(db.Integer, db.ForeignKey("user_delivery_addresses.id"))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    delivered_at = db.Column(db.DateTime)
    status = db.Column(db.String, default="новый")
    price = db.Column(db.Integer, nullable=False)

    user = db.relationship("User", back_populates="orders")
    delivery_address = db.relationship("UserDeliveryAddress")
    items = db.relationship("OrderItem", back_populates="order", lazy=True)

class OrderItem(db.Model):
    __tablename__ = "order_items"

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey("orders.id"), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Integer, nullable=False)

    order = db.relationship("Order", back_populates="items")
    product = db.relationship("Product")

class ContactMessage(db.Model):
    __tablename__ = "contact_message"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(30))
    subject = db.Column(db.String(50))
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

#Подключение к уже существующей БД:
def init_db(app):
    BASE_DIR = os.path.abspath(os.path.dirname(__file__)) #путь к папке, где этот файл

    db_path = os.path.join(BASE_DIR, 'db', 'products.db')
    db_uri = f"sqlite:///{db_path}"

    app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)
