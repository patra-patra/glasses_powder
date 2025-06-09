import os
import sys
import re
from flask import Flask, render_template, request, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask import session  # ← это для сессии

# Добавляем путь к backend
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.app.models.utils import get_all_products
from backend.app.models.product import db, init_db, User, Product, Order

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


# Выход
@app.route('/logout')
def logout():
    session.pop('user_id', None)
    flash("Вы вышли из аккаунта", "info")
    return redirect(url_for('login'))

# Профиль — заглушка (можно развивать)
@app.route('/profile')
def profile():
    user_id = session.get('user_id')
    if not user_id:
        flash("Пожалуйста, войдите в аккаунт", "error")
        return redirect(url_for('login'))

    user = User.query.get(user_id)
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


# Запуск приложения
if __name__ == '__main__':
    app.run(debug=True)
