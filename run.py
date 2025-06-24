import os
import sys
from werkzeug.utils import secure_filename
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from backend.app.models.product import db, init_db, User, Product, Order, UserDeliveryAddress, OrderItem, ContactMessage
from flask import session, abort
from sqlalchemy import func, desc
from flask import session, request, jsonify
from flask import render_template, request, redirect, url_for, flash
from datetime import datetime, timedelta
from flask import g, session
from flask import Flask, request, redirect, url_for, flash
from flask_login import current_user, login_required
from sqlalchemy import or_
from random import sample
from flask import request, flash
from datetime import timedelta
from sqlalchemy.sql.expression import func
import random

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DB_PATH = os.path.join(BASE_DIR, "backend", "app", "db", "products.db")

app = Flask(
    __name__,
    static_folder=os.path.join(BASE_DIR, "backend", "app", "static"),
    template_folder=os.path.join(BASE_DIR, "backend", "app", "templates")
)
app.secret_key = 'supersecretkey'

app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{DB_PATH}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    pass

@app.route('/')
def home():
    new_products = Product.query.order_by(func.random()).limit(4).all()

    return render_template('index.html', new_products=new_products)

@app.route('/account')
def account():
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('reg'))

    user = db.session.get(User, session['user_id'])

    if not user:
        return redirect(url_for('reg'))

    orders = Order.query.filter_by(user_id=user_id).order_by(Order.created_at.desc()).all()
    addresses = UserDeliveryAddress.query.filter_by(user_id=user.id).all()

    return render_template('account.html', user=user, addresses=addresses, orders=orders, datetime=datetime)

@app.route('/repeat_order/<int:order_id>', methods=['POST'])
def repeat_order(order_id):
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('reg'))

    old_order = Order.query.filter_by(id=order_id, user_id=user_id).first()
    if not old_order:
        flash('Заказ не найден', 'error')
        return redirect(url_for('account'))

    try:
        order_price = old_order.price
        if not order_price or order_price == 0:
            order_price = sum(item.price * item.quantity for item in old_order.items)

        delivered_at = datetime.utcnow() + timedelta(days=2)

        new_order = Order(
            user_id=user_id,
            delivery_address_id=old_order.delivery_address_id,
            created_at=datetime.utcnow(),
            delivered_at=delivered_at,
            status='новый',
            price=order_price
        )
        db.session.add(new_order)
        db.session.flush()

        for item in old_order.items:
            new_item = OrderItem(
                order_id=new_order.id,
                product_id=item.product_id,
                quantity=item.quantity,
                price=int(item.price)
            )
            db.session.add(new_item)

        db.session.commit()
        flash('Заказ успешно повторён', 'success')
    except Exception as e:
        db.session.rollback()
        print(f"Ошибка при повторении заказа: {e}")
        flash('Ошибка при повторении заказа', 'error')

    return redirect(url_for('account'))

@app.template_filter('sum')
def sum_total(items, attribute='price', multiply='quantity'):
    total = 0
    for item in items:
        value = getattr(item, attribute) or 0
        qty = getattr(item, multiply) or 0
        total += value * qty
    return total

@app.route('/update_default_address', methods=['POST'])
@login_required
def update_default_address():
    user_id = current_user.id
    default_address_id = request.form.get('default_address')

    if not default_address_id:
        flash("Выберите адрес для установки по умолчанию.", "error")
        return redirect(url_for('account'))

    UserDeliveryAddress.query.filter_by(user_id=user_id).update({'default': 0})

    address = UserDeliveryAddress.query.filter_by(id=default_address_id, user_id=user_id).first()
    if not address:
        flash("Адрес не найден.", "error")
        return redirect(url_for('account'))

    address.default = 1
    db.session.commit()

    flash("Основной адрес успешно обновлен.", "success")
    return redirect(url_for('account'))

@app.route('/catalog/<category>')
def catalog_category(category):
    return redirect(url_for('catalog', type=category))

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        if not request.form.get('consent'):
            flash('Вы должны согласиться на обработку персональных данных.', 'error')
            return redirect(url_for('contact'))

        name = request.form.get('name')
        email = request.form.get('email')
        phone = request.form.get('phone')
        subject = request.form.get('subject')
        message = request.form.get('message')

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

@app.route('/reg')
def reg():
    return render_template('registration_auth.html')

@app.before_request
def load_cart_quantity():
    cart = session.get('cart', {})
    g.cart_quantity = sum(cart.values()) if cart else 0

@app.context_processor
def inject_session():
    return dict(session=session)

@app.route('/add_to_cart', methods=['POST'])
def add_to_cart():
    product_id = request.form.get('product_id')

    if not product_id:
        return redirect(url_for('home'))

    cart = session.get('cart', {})

    if product_id in cart:
        cart[product_id] += 1
    else:
        cart[product_id] = 1

    session['cart'] = cart
    session.modified = True

    referer = request.headers.get("Referer")
    if referer:
        return redirect(referer)
    else:
        return redirect(url_for('home'))

@app.route('/cart')
def cart():
    cart = session.get('cart', {})
    products = []

    if cart:
        product_ids = []
        for key in cart.keys():
            try:
                product_ids.append(int(key))
            except ValueError:
                continue

        products_db = Product.query.filter(Product.id.in_(product_ids)).all()

        for product in products_db:
            quantity = cart.get(str(product.id), 0)
            products.append({
                'id': product.id,
                'name': product.name,
                'price': product.price,
                'quantity': quantity,
                'image': product.photonum
            })

    total_price = sum(item['price'] * item['quantity'] for item in products)

    return render_template('cart.html', products=products, total_price=total_price)

@app.route('/create_order', methods=['POST'])
def create_order():
    user_id = session.get('user_id')
    if not user_id:
        flash("Пожалуйста, войдите в аккаунт, чтобы оформить заказ.")
        return redirect(url_for('reg'))

    cart = session.get('cart', {})
    if not cart:
        flash("Ваша корзина пуста.")
        return redirect(url_for('cart'))

    address = UserDeliveryAddress.query.filter_by(user_id=user_id).first()
    if not address:
        flash("Пожалуйста, укажите адрес доставки в профиле.")
        return redirect(url_for('account'))

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
    db.session.flush()

    total_price = 0.0

    for product_id_str, qty in cart.items():
        try:
            product_id = int(product_id_str)
            quantity = int(qty)
        except (ValueError, TypeError):
            continue

        if quantity <= 0:
            continue

        product = Product.query.get(product_id)
        if not product:
            continue

        item_price = product.price or 0
        total_price += item_price * quantity

        db.session.add(OrderItem(
            order_id=order.id,
            product_id=product_id,
            quantity=quantity,
            price=item_price
        ))

    order.price = total_price

    db.session.commit()
    session.pop('cart', None)
    flash("Заказ успешно оформлен!")
    return redirect(url_for('account'))

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
        first_name = request.form.get('first_name')
        last_name = request.form.get('last_name')
        phone = request.form.get('phone')
        password = request.form.get('password')
        birthdate_str = request.form.get('birthdate')
        birthdate = datetime.strptime(birthdate_str, '%Y-%m-%d').date() if birthdate_str else None

        street = request.form.get('street')
        city = request.form.get('city')

        user = User(
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            password=password,
            birthdate=birthdate
        )
        db.session.add(user)
        db.session.commit()

        print(user)
        print(user.id)

        address = UserDeliveryAddress(
            user_id=user.id,
            street=street,
            city=city
        )
        db.session.add(address)
        db.session.commit()

        session['user_id'] = user.id

        print("Зарегистрирован:", user.id)

        return redirect(url_for('account'))

    except Exception as e:
        print("Ошибка при регистрации:", e)
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('reg'))

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Нет данных'}), 400

    phone = data.get('phone')
    password = data.get('password')

    user = User.query.filter_by(phone=phone).first()
    if not user or user.password != password:
        return jsonify({'error': 'Неверный телефон или пароль'}), 401

    session['user_id'] = user.id

    if user.id == 1:
        return jsonify({'message': 'Админ вошёл', 'redirect': url_for('admin_panel')})
    else:
        return jsonify({'message': 'Успешный вход', 'redirect': url_for('account')})

@app.route('/update_profile', methods=['POST'])
def update_profile():
    if not session.get('user_id'):
        return jsonify({'error': 'Пользователь не авторизован'}), 401

    data = request.get_json()
    user = db.session.get(User, session['user_id'])

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
    print("Data from request:", data)

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

@app.route('/add_address', methods=['POST'])
@login_required
def add_address():
    city = request.form.get('city')
    street = request.form.get('street')
    default = request.form.get('default') == '1'
    print("Form data:", request.form)
    if not city or not street:
        flash('Пожалуйста, заполните все обязательные поля')
        return redirect(url_for('account'))

    if default:
        for addr in current_user.delivery_addresses:
            addr.default = 0

    new_address = UserDeliveryAddress(
        user_id=current_user.id,
        city=city,
        street=street,
        default=1 if default else 0
    )

    db.session.add(new_address)
    db.session.commit()

    print("Form data:", request.form)
    print("Current user ID:", current_user.id)

    flash('Адрес успешно добавлен')
    return redirect(url_for('account'))

@app.route('/catalog')
def catalog():
    selected_brands = request.args.getlist('brand')
    selected_country = request.args.get('country')
    min_price = request.args.get('min_price', type=int)
    max_price = request.args.get('max_price', type=int)
    product_type = request.args.get('type')
    sort = request.args.get('sort', 'popularity')
    order = request.args.get('order', 'desc')
    page = request.args.get('page', 1, type=int)
    category = request.args.get('category')
    query_text = request.args.get('q', '').strip().lower()
    per_page = 102

    query = Product.query

    if query_text:
        query = query.filter(
            or_(
                Product.name.ilike(f'%{query_text}%'),
                Product.brand.ilike(f'%{query_text}%'),
                Product.types.ilike(f'%{query_text}%'),
                Product.country.ilike(f'%{query_text}%'),
                Product.desc.ilike(f'%{query_text}%')
            )
        )

    if product_type:
        query = query.filter(Product.types == product_type)
    elif category == 'cosmetics':
        query = query.filter(Product.types.in_([
            'Товары для лица', 'Товары для губ', 'Товары для бровей', 'Товары для глаз'
        ]))
    elif category == 'glasses':
        query = query.filter(Product.types.in_([
            'Мужские', 'Женские', 'Унисекс'
        ]))

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

    if sort == 'price':
        query = query.order_by(Product.price.asc() if order == 'asc' else Product.price.desc())
    elif sort == 'popularity':
        query = (
            query
            .outerjoin(OrderItem, OrderItem.product_id == Product.id)
            .group_by(Product.id)
            .order_by(func.coalesce(func.sum(OrderItem.quantity), 0).desc())
        )
    elif sort == 'new':
        query = query.order_by(Product.id.desc())
    else:
        query = query.order_by(Product.id.desc())

    products = query.paginate(page=page, per_page=per_page)

    all_brands = db.session.query(Product.brand).distinct().all()
    all_countries = db.session.query(Product.country).distinct().all()

    countries = []
    for (country,) in all_countries:
        if not country or country.strip() == "":
            countries.append("Страна не указана")
        else:
            countries.append(country.strip())
    countries = sorted(set(countries))

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
        current_type=product_type,
        query=query_text,
        sort=sort,
        order=order,
        category=category
    )

def get_products_sorted_by_popularity(include_zero_orders=True):
    query = (
        db.session.query(
            Product,
            func.coalesce(func.sum(OrderItem.quantity), 0).label("total_orders")
        )
        .outerjoin(OrderItem, OrderItem.product_id == Product.id)
        .group_by(Product.id)
        .order_by(desc("total_orders"))
    )
    return [
        {**product.to_dict(), "total_orders": int(total_orders)}
        for product, total_orders in query.all()
    ]

@app.route('/search')
def search():
    query = request.args.get('q', '').strip()
    sort = request.args.get('sort', 'popularity')
    order = request.args.get('order', 'desc')
    product_type = request.args.get('type')
    category = request.args.get('category')

    products_query = Product.query

    if product_type:
        products_query = products_query.filter(Product.types == product_type)
    elif category == 'cosmetics':
        products_query = products_query.filter(Product.types.in_([
            'Товары для лица', 'Товары для губ', 'Товары для бровей', 'Товары для глаз'
        ]))
    elif category == 'glasses':
        products_query = products_query.filter(Product.types.in_([
            'Мужские', 'Женские', 'Унисекс'
        ]))

    if query:
        search_term = f"%{query}%"
        products_query = products_query.filter(
            (Product.name.ilike(search_term)) | (Product.desc.ilike(search_term))
        )

    if sort == 'price':
        products_query = products_query.order_by(Product.price.asc() if order == 'asc' else Product.price.desc())
    elif sort == 'new':
        products_query = products_query.order_by(Product.id.desc())
    else:
        products_query = products_query.order_by(Product.id.desc())

    products = products_query.limit(100).all()

    return render_template('partials/product_list.html', products=products)

@app.route('/product/<int:product_id>')
def product_page(product_id):
    product = Product.query.get_or_404(product_id)

    same_category_products = Product.query.filter(Product.types == product.types, Product.id != product.id).all()

    recommended = sample(same_category_products, min(4, len(same_category_products)))

    return render_template('product.html', product=product, recommended=recommended)

def generate_discount(product):
    multiplier = random.uniform(1.1, 1.66)
    old_price = round(product.price * multiplier, 2)
    discount_percent = round(100 * (old_price - product.price) / old_price)

    product.old_price = old_price
    product.discount_percent = discount_percent

UPLOAD_FOLDER = 'static/img/products'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def is_admin():
    return session.get('user_id') == 1

@app.route('/admin')
def admin_panel():
    products = Product.query.all()
    orders = Order.query.order_by(Order.created_at.desc()).all()

    cosmetics_subcategories = db.session.query(Product.types).filter(
        Product.types.in_([
            'Товары для лица', 'Товары для губ', 'Товары для бровей', 'Товары для глаз'
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

@app.route('/admin/add_product', methods=['GET', 'POST'])
def add_product():
    if not is_admin():
        return abort(403)

    photonum = None
    DEFAULT_IMAGE = 'default.jpg'

    if request.method == 'POST':
        name = request.form['name']
        price = float(request.form['price'])
        desc = request.form['desc']
        brand = request.form['brand']
        country = request.form['country']
        types = request.form['types']

        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

        file = request.files.get('image')
        manual_image_name = request.form.get('image_name', '').strip()

        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        photonum = filename

        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            photonum = filename
        elif manual_image_name:
            secure_name = secure_filename(manual_image_name)
            manual_image_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_name)
            if os.path.exists(manual_image_path):
                photonum = secure_name
            else:
                photonum = DEFAULT_IMAGE
        else:
            photonum = DEFAULT_IMAGE

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
        return render_template('add_product.html', photonum=photonum)

    return render_template('add_product.html')

@app.route('/admin/edit_product/<int:product_id>', methods=['GET', 'POST'])
def edit_product(product_id):
    if not is_admin():
        return abort(403)

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

@app.route('/admin/delete_product/<int:product_id>', methods=['POST'])
def delete_product(product_id):
    if not is_admin():
        return abort(403)

    product = Product.query.get_or_404(product_id)
    db.session.delete(product)
    db.session.commit()
    flash('Товар удалён!', 'info')

    return redirect(url_for('admin_panel'))

if __name__ == '__main__':
    app.run(debug=True)
