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
from backend.app.models.product import db, init_db, User, Product, Order, UserDeliveryAddress, OrderItem, ContactMessage
from flask import abort

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

# Главная страница
from sqlalchemy.sql.expression import func

@app.route('/')
def home():
    # Выбираем 4 случайных товара из базы данных
    new_products = Product.query.order_by(func.random()).limit(4).all()

    return render_template('index.html', new_products=new_products)

@app.route('/account')
def account():
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('reg'))

    user = db.session.get(User, user_id)
    if not user:
        return redirect(url_for('reg'))

    orders = Order.query.filter_by(user_id=user_id).order_by(Order.created_at.desc()).all()
    addresses = UserDeliveryAddress.query.filter_by(user_id=user.id).all()

    # 👇 Добавляем orders
    return render_template('account.html', user=user, addresses=addresses, orders=orders)

@app.template_filter('sum')
def sum_total(items, attribute='price', multiply='quantity'):
    total = 0
    for item in items:
        value = getattr(item, attribute) or 0
        qty = getattr(item, multiply) or 0
        total += value * qty
    return total

@app.route('/catalog/<category>')
def catalog_category(category):
    # Просто редиректим на /catalog с параметром type=category
    return redirect(url_for('catalog', type=category))

from flask import render_template, request, redirect, url_for, flash
from datetime import datetime

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        # Проверка согласия на обработку данных
        if not request.form.get('consent'):
            flash('Вы должны согласиться на обработку персональных данных.', 'error')
            return redirect(url_for('contact'))

        # Сбор данных из формы
        name = request.form.get('name')
        email = request.form.get('email')
        phone = request.form.get('phone')
        subject = request.form.get('subject')
        message = request.form.get('message')

        # Сохранение в БД
        new_message = ContactMessage(
            name=name,
            email=email,
            phone=phone,
            subject=subject,
            message=message,
            created_at=datetime.utcnow()
        )
        db.session.add(new_message)
        db.session.commit()

        flash('Сообщение успешно отправлено!', 'success')
        return redirect(url_for('contact'))

    return render_template('contact.html')

@app.route('/glasses')
def glasses():
    return render_template('glasses.html')

@app.route('/reg')
def reg():
    return render_template('registration_auth.html')

@app.context_processor
def inject_session():
    return dict(session=session)

from flask import session, request, jsonify

@app.route('/add_to_cart', methods=['POST'])
def add_to_cart():
    product_id = request.form.get('product_id')

    if not product_id:
        return redirect(url_for('home'))

    cart = session.get('cart', {})

    # Увеличиваем количество товара или добавляем с 1
    if product_id in cart:
        cart[product_id] += 1
    else:
        cart[product_id] = 1

    session['cart'] = cart
    session.modified = True

    return redirect(url_for('cart'))

@app.route('/cart')
def cart():
    cart = session.get('cart', {})
    products = []

    if cart:
        product_ids = list(map(int, cart.keys()))
        products_db = Product.query.filter(Product.id.in_(product_ids)).all()

        for product in products_db:
            quantity = cart.get(str(product.id), 0)
            products.append({
                'id': product.id,
                'name': product.name,
                'price': product.price,
                'quantity': quantity,
                'image': product.photonum  # имя файла с изображением
            })

    total_price = sum(item['price'] * item['quantity'] for item in products)

    return render_template('cart.html', products=products, total_price=total_price)

from flask import request, session, redirect, url_for, flash
from datetime import datetime, timedelta
import random

@app.route('/create_order', methods=['POST'])
def create_order():
    cart = session.get('cart', {})
    user_id = session.get('user_id')

    if not cart or not user_id:
        flash("Корзина пуста или вы не вошли в аккаунт.")
        return redirect(url_for('cart'))

    address = UserDeliveryAddress.query.filter_by(user_id=user_id).first()
    if not address:
        flash("Укажите адрес доставки в профиле.")
        return redirect(url_for('cart'))

    now = datetime.now()
    delivered_at = now + timedelta(days=random.randint(1, 30))

    order = Order(
        user_id=user_id,
        delivery_address_id=address.id,
        created_at=now,
        delivered_at=delivered_at,
        status="в пути"
    )
    db.session.add(order)
    db.session.flush()  # чтобы получить order.id

    for product_id_str, qty in cart.items():
        product_id = int(product_id_str)
        product = Product.query.get(product_id)
        if not product:
            continue  # на всякий случай пропускаем отсутствующий продукт
        db.session.add(OrderItem(
            order_id=order.id,
            product_id=product_id,
            quantity=qty,
            price=product.price or 0  # если вдруг price None, ставим 0
        ))

    db.session.commit()
    session.pop('cart', None)
    flash("Заказ успешно оформлен!")
    return redirect(url_for('account'))

from flask import request, redirect, url_for, session

@app.route('/update_cart', methods=['POST'])
def update_cart():
    product_id = request.form.get('product_id')
    quantity = request.form.get('quantity')

    try:
        quantity = int(quantity)
    except (TypeError, ValueError):
        return redirect(url_for('cart'))

    cart = session.get('cart', {})

    if quantity <= 0:
        cart.pop(product_id, None)
    else:
        cart[product_id] = quantity

    session['cart'] = cart
    session.modified = True

    return redirect(url_for('cart'))

@app.route('/register', methods=['POST'])
def register():
    try:
        # Получаем данные
        first_name = request.form.get('first_name')
        last_name = request.form.get('last_name')
        phone = request.form.get('phone')
        password = request.form.get('password')
        birthdate_str = request.form.get('birthdate')
        birthdate = datetime.strptime(birthdate_str, '%Y-%m-%d').date() if birthdate_str else None


        # Адрес
        street = request.form.get('street')
        city = request.form.get('city')

        # Создаём пользователя
        user = User(
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            password=password,
            birthdate=birthdate
        )
        db.session.add(user)
        db.session.commit()  # После commit у user должен быть id

        print(user)  # Проверь, что user не None
        print(user.id)  # Проверь, что id есть

        # Создаём адрес
        address = UserDeliveryAddress(
            user_id=user.id,
            street=street,
            city=city
        )
        db.session.add(address)
        db.session.commit()

        session['user_id'] = user.id

        print("Зарегистрирован:", user.id)

        # Возвращаем JSON
        return jsonify({'success': True, 'redirect': url_for('account')})

    except Exception as e:
        print("Ошибка при регистрации:", e)
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/logout')
def logout():
    session.clear()  # очищаем все данные сессии, в том числе user_id
    return redirect(url_for('reg'))  # перенаправляем на страницу регистрации/входа

@app.route('/login', methods=['POST'])
def login():
    # Если это fetch с JSON, читаем через request.get_json()
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Нет данных'}), 400

    phone = data.get('phone')
    password = data.get('password')

    user = User.query.filter_by(phone=phone).first()
    if not user or user.password != password:
        return jsonify({'error': 'Неверный телефон или пароль'}), 401

    # Успешный вход — сохраняем user_id в сессию
    session['user_id'] = user.id
    return jsonify({'message': 'Успешный вход'})

@app.route('/update_profile', methods=['POST'])
def update_profile():
    if not session.get('user_id'):
        return jsonify({'error': 'Пользователь не авторизован'}), 401

    data = request.get_json()
    user = User.query.get(session['user_id'])

    user.first_name = data.get('first_name', user.first_name)
    user.last_name = data.get('last_name', user.last_name)
    user.phone = data.get('phone', user.phone)
    user.birthdate = data.get('birthdate') or None

    db.session.commit()

    return jsonify({'message': 'Данные обновлены'}), 200

@app.route('/change_password', methods=['POST'])
def change_password():
    if 'user_id' not in session:
        return jsonify({'error': 'Пользователь не авторизован'}), 401

    data = request.get_json()
    print("Data from request:", data)  # <-- для отладки

    if not data:
        return jsonify({'error': 'Нет данных'}), 400

    current = data.get('current_password')
    new = data.get('new_password')

    if not current or not new:
        return jsonify({'error': 'Не указаны пароли'}), 400

    user = User.query.get(session['user_id'])

    if user.password != current:
        return jsonify({'error': 'Неверный текущий пароль'}), 400

    user.password = new
    db.session.commit()

    return jsonify({'message': 'Пароль успешно обновлён'}), 200

@app.route('/catalog')
def catalog():
    selected_brands = request.args.getlist('brand')
    selected_country = request.args.get('country')  # ← Новое
    min_price = request.args.get('min_price', type=int)
    max_price = request.args.get('max_price', type=int)
    product_type = request.args.get('type')
    sort = request.args.get('sort', 'popularity')
    order = request.args.get('order', 'desc')
    page = request.args.get('page', 1, type=int)
    selected_type = request.args.getlist('type')
    category = request.args.get('category')
    per_page = 102

    query = Product.query

    # Если выбрана категория
    if category == 'cosmetics':
        query = query.filter(Product.types.in_([
            'Товары для лица', 'Товары для губ', 'Товары для бровей', 'Товары для глах'
        ]))
    elif category == 'glasses':
        query = query.filter(Product.types.in_([
            'Мужские', 'Женские', 'Унисекс'
        ]))

    if product_type:
        query = query.filter(Product.types == product_type)

    if selected_brands:
        query = query.filter(Product.brand.in_(selected_brands))

    if selected_country:
        if selected_country == 'Страна не указана':
            query = query.filter((Product.country == '') | (Product.country == None))
        else:
            query = query.filter(Product.country == selected_country)

    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    # Сортировка
    if sort == 'price':
        query = query.order_by(Product.price.asc() if order == 'asc' else Product.price.desc())
    elif sort == 'new':
        query = query.order_by(Product.id.desc())
    else:
        query = query.order_by(Product.id.desc())

    products = query.paginate(page=page, per_page=per_page)

    # Уникальные бренды и страны
    all_brands = db.session.query(Product.brand).distinct().all()
    all_countries = db.session.query(Product.country).distinct().all()

    # Очистка и нормализация стран
    countries = []
    for (country,) in all_countries:
        if not country or country.strip() == "":
            countries.append("Страна не указана")
        else:
            countries.append(country.strip())

    countries = sorted(set(countries))  # Удалим дубли и отсортируем

    brands = [b[0] for b in all_brands]

    return render_template(
        'empty_category_page.html',
        products=products,
        brands=brands,
        countries=countries,
        selected_brands=selected_brands,
        selected_country=selected_country,
        min_price=min_price,
        max_price=max_price,
        current_type=product_type
    )

from flask import request

@app.route('/search')
def search():
    query = request.args.get('q', '').strip()
    sort = request.args.get('sort', 'popularity')  # default
    order = request.args.get('order', 'desc')

    products_query = Product.query

    if query:
        search_term = f"%{query}%"
        products_query = products_query.filter(
            (Product.name.ilike(search_term)) | (Product.desc.ilike(search_term))
        )

    # Сортировка
    if sort == 'price':
        if order == 'asc':
            products_query = products_query.order_by(Product.price.asc())
        else:
            products_query = products_query.order_by(Product.price.desc())
    elif sort == 'new':
        products_query = products_query.order_by(Product.id.desc())  # ID = новизна
    else:  # popularity (заглушка)
        products_query = products_query.order_by(Product.id.desc())  # позже заменить

    products = products_query.limit(100).all()

    return render_template('partials/_product_list.html', products=products)



#=========Админ=============
def is_admin():
    return session.get('user_id') == 1  # например, id 1 — админ

# Панель администратора
@app.route('/admin')
def admin_panel():
    products = Product.query.all()
    orders = Order.query.order_by(Order.created_at.desc()).all()

    # Категории из БД
    cosmetics_subcategories = db.session.query(Product.types).filter(
        Product.types.in_([
            'Товары для лица', 'Товары для губ', 'Товары для бровей', 'Товары для глах'
        ])
    ).distinct().all()

    glasses_subcategories = db.session.query(Product.types).filter(
        Product.types.in_([
            'Мужские', 'Женские', 'Унисекс'
        ])
    ).distinct().all()

    cosmetics_subcategories = [sub[0] for sub in cosmetics_subcategories]
    glasses_subcategories = [sub[0] for sub in glasses_subcategories]

    return render_template(
        'admin_panel.html',
        products=products,
        orders=orders,
        cosmetics_subcategories=cosmetics_subcategories,
        glasses_subcategories=glasses_subcategories
    )


# Добавление товара (форма и обработка)
@app.route('/admin/add_product', methods=['GET', 'POST'])
def add_product():
    # if not is_admin():
    #     return abort(403)

    if request.method == 'POST':
        name = request.form['name']
        price = float(request.form['price'])
        desc = request.form['desc']
        brand = request.form['brand']
        country = request.form['country']
        types = request.form['types']
        photonum = request.form['photonum']

        new_product = Product(
            name=name,
            price=price,
            desc=desc,
            brand=brand,
            country=country,
            types=types,
            photonum=photonum
        )
        db.session.add(new_product)
        db.session.commit()
        flash('Товар добавлен!', 'success')
        return redirect(url_for('admin_panel'))

    return render_template('add_product.html')

# Редактирование товара
@app.route('/admin/edit_product/<int:product_id>', methods=['GET', 'POST'])
def edit_product(product_id):
    # if not is_admin():
    #     return abort(403)

    product = Product.query.get_or_404(product_id)

    if request.method == 'POST':
        product.name = request.form['name']
        product.price = float(request.form['price'])
        product.desc = request.form['desc']
        product.brand = request.form['brand']
        product.country = request.form['country']
        product.types = request.form['types']
        product.photonum = request.form['photonum']
        db.session.commit()
        flash('Товар обновлён!', 'success')
        return redirect(url_for('admin_panel'))

    return render_template('edit_product.html', product=product)

# Удаление товара
@app.route('/admin/delete_product/<int:product_id>', methods=['POST'])
def delete_product(product_id):
    # if not is_admin():
    #     return abort(403)

    product = Product.query.get_or_404(product_id)
    db.session.delete(product)
    db.session.commit()
    flash('Товар удалён!', 'info')
    return redirect(url_for('admin_panel'))

# Запуск приложения
if __name__ == '__main__':
    app.run(debug=True)
