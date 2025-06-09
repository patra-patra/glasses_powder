import os
import sys
import re
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask import session  # ← это для сессии
import random
from datetime import timedelta, datetime

# Добавляем путь к backend
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.app.models.utils import get_all_products
from backend.app.models.product import db, init_db, User, Product, Order, OrderItem

# Путь к БД
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DB_PATH = os.path.join(BASE_DIR, "backend", "app", "db", "products.db")

# Создание Flask-приложения
app = Flask(
    __name__,
    static_folder=os.path.join(BASE_DIR, "backend", "app", "static"),
    template_folder=os.path.join(BASE_DIR, "backend", "app", "templates")
)
app.secret_key = 'supersecretkey'

# Настройки базы данных
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{DB_PATH}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Инициализация базы
db.init_app(app)

with app.app_context():
    # Таблицы уже есть, не вызываем db.create_all()
    pass

# Функция нормализации номера телефона
def normalize_phone(phone):
    digits = re.sub(r'\D', '', phone)
    if digits.startswith('8'):
        digits = '7' + digits[1:]
    if not digits.startswith('7'):
        digits = '7' + digits  # подстраховка
    return f'+{digits}'

# Главная страница
@app.route("/")
def home():
    return render_template("index.html")

# API для продуктов
@app.route("/api/products")
def products():
    return {"products": get_all_products()}

@app.route('/login', methods=['GET', 'POST'])
def login():
    if session.get('user_id'):
        return redirect(url_for('profile'))  # Уже вошёл

    if request.method == 'POST':
        phone_raw = request.form.get('phone')
        phone = normalize_phone(phone_raw)
        user = User.query.filter_by(phone=phone).first()

        if user:
            session['user_id'] = user.id
            flash("Вы вошли в личный кабинет", "success")
            return redirect(url_for('profile'))
        else:
            flash("Пользователь с таким номером не найден", "error")

    return render_template('login.html')


@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    flash("Вы вышли из аккаунта", "info")
    return redirect(url_for('login'))


from flask import session, redirect, url_for, render_template, request, flash

@app.route('/profile', methods=['GET', 'POST'])
def profile():
    user_id = session.get('user_id')
    if not user_id:
        flash("Пожалуйста, войдите в аккаунт", "error")
        return redirect(url_for('login'))

    user = User.query.get(user_id)

    if request.method == 'POST':
        # Обновляем только город и адрес
        user.city = request.form.get('city')
        user.address = request.form.get('address')
        db.session.commit()
        flash("Данные успешно обновлены", "success")
        return redirect(url_for('profile'))

    return render_template('profile.html', user=user)


# Страница регистрации
@app.route('/register', methods=['GET', 'POST'])
def register():
    if session.get('user_id'):
        return redirect(url_for('profile'))  # Уже вошёл

    if request.method == 'POST':
        phone_raw = request.form['phone']
        phone = normalize_phone(phone_raw)

        existing_user = User.query.filter_by(phone=phone).first()
        if existing_user:
            flash('Пользователь с таким номером уже существует', 'error')
            return render_template('register.html')

        user = User(
            first_name=request.form['first_name'],
            last_name=request.form['last_name'],
            phone=phone,
            city=request.form['city'],
            address=request.form['address'],
            birthdate=f"{request.form['birth_year']}-{request.form['birth_month'].zfill(2)}-{request.form['birth_day'].zfill(2)}"
        )
        db.session.add(user)
        db.session.commit()

        session['user_id'] = user.id  # Автоматически входим после регистрации
        flash("Регистрация прошла успешно!", "success")
        return redirect(url_for('profile'))

    return render_template('register.html')

@app.route('/catalog')
def catalog():
    products = get_all_products()  # возвращает список словарей
    return render_template('catalog.html', products=products)

@app.route('/add_to_cart/<int:product_id>', methods=['POST'])
def add_to_cart(product_id):
    cart = session.get('cart', {})

    # Увеличиваем количество
    cart[str(product_id)] = cart.get(str(product_id), 0) + 1

    session['cart'] = cart
    return jsonify({'message': 'Товар добавлен в корзину', 'cart': cart})

@app.route('/basket')
def basket():
    cart = session.get('cart', {})

    products_in_cart = []
    total_price = 0

    for pid, qty in cart.items():
        product = Product.query.get(int(pid))
        if product:
            item_total = product.price * qty
            total_price += item_total
            products_in_cart.append({
                'id': product.id,
                'name': product.name,
                'price': product.price,
                'quantity': qty,
                'total': item_total,
                'photonum': product.photonum
            })

    return render_template('basket.html', products=products_in_cart, total_price=total_price)

@app.route('/basket_count')
def basket_count():
    cart = session.get('cart', {})
    count = sum(cart.values())
    return jsonify({'count': count})

import random
from datetime import timedelta

@app.route('/order', methods=['POST'])
def create_order():
    cart = session.get('cart', {})
    if not cart:
        return redirect(url_for('cart_page'))  # если корзина пуста

    new_order = Order()
    delivery_days = random.randint(1, 10)
    new_order.delivered_at = datetime.utcnow() + timedelta(days=delivery_days)
    db.session.add(new_order)
    db.session.flush()  # чтобы получить id заказа

    for product_id, quantity in cart.items():
        item = OrderItem(
            product_id=product_id,
            order_id=new_order.id,
            quantity=quantity
        )
        db.session.add(item)

    db.session.commit()
    session['cart'] = {}  # очистка корзины
    return render_template('order_success.html', delivery_date=new_order.delivered_at)


# Запуск приложения
if __name__ == '__main__':
    app.run(debug=True)
