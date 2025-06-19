document.addEventListener('DOMContentLoaded', function () {
    // Карусель
    let currentSlide = 0;
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dot');
    const totalSlides = slides.length;

    // Функция для переключения слайдов
    function showSlide(index) {
        // Убираем активный класс со всех слайдов и точек
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        // Добавляем активный класс к текущему слайду и точке
        slides[index].classList.add('active');
        dots[index].classList.add('active');

        currentSlide = index;
    }

    // Автоматическое переключение слайдов
    setInterval(() => {
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
    }, 5000);

    // Обработчик клика по точкам
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
        });
    });

    // Переключение между формами
    const loginBtn = document.querySelector('.login-btn');
    const registerBtn = document.querySelector('.register-btn');
    const switchToRegister = document.querySelector('.switch-to-register');
    const switchToLogin = document.querySelector('.switch-to-login');


    const welcomeBlock = document.querySelector('.auth-welcome');
    const loginForm = document.querySelector('.login-form');
    const registerForm = document.querySelector('.register-form');

    // Изначально все формы скрыты, виден только блок приветствия
    welcomeBlock.classList.remove('hidden');
    loginForm.classList.remove('form-active');
    registerForm.classList.remove('form-active');

    // Функция для показа формы входа
    function showLoginForm() {
        welcomeBlock.classList.add('hidden');
        registerForm.classList.remove('form-active');
        loginForm.classList.add('form-active');
    }

    // Функция для показа формы регистрации
    function showRegisterForm() {
        welcomeBlock.classList.add('hidden');
        loginForm.classList.remove('form-active');
        registerForm.classList.add('form-active');
    }

    // Обработчики событий для кнопок
    loginBtn.addEventListener('click', showLoginForm);
    registerBtn.addEventListener('click', showRegisterForm);
    switchToRegister.addEventListener('click', function (e) {
        e.preventDefault();
        showRegisterForm();
    });
    switchToLogin.addEventListener('click', function (e) {
        e.preventDefault();
        showLoginForm();
    });

    // Функция для создания маски телефона
    function setupPhoneInput(inputElement, errorElement) {
        // Обработка нажатия клавиш
        inputElement.addEventListener('keydown', function (e) {
            // Разрешаем: backspace, delete, tab, escape, enter, цифры
            if (
                e.key === 'Backspace' ||
                e.key === 'Delete' ||
                e.key === 'Tab' ||
                e.key === 'Escape' ||
                e.key === 'Enter' ||
                (e.key >= '0' && e.key <= '9')
            ) {
                // Разрешаем стандартное поведение
                return;
            } else {
                // Запрещаем ввод других символов
                e.preventDefault();
            }
        });

        // Форматирование при вводе
        inputElement.addEventListener('input', function (e) {
            let cursorPosition = e.target.selectionStart;
            const initialLength = e.target.value.length;

            // Удаляем все нецифровые символы
            let value = e.target.value.replace(/\D/g, '');

            // Ограничиваем до 11 цифр (российский номер)
            if (value.length > 11) {
                value = value.substring(0, 11);
            }

            // Если первая цифра 8, заменяем на 7
            if (value.length > 0 && value[0] === '8') {
                value = '7' + value.substring(1);
            }

            // Добавляем 7 в начало, если первая цифра не 7
            if (value.length > 0 && value[0] !== '7') {
                value = '7' + value;
            }

            // Форматируем номер с разделителями
            let formattedValue = '';

            if (value.length > 0) {
                formattedValue = '+' + value[0];
            }

            if (value.length > 1) {
                formattedValue += ' (' + value.substring(1, Math.min(4, value.length));
            }

            if (value.length > 4) {
                formattedValue += ') ' + value.substring(4, Math.min(7, value.length));
            }

            if (value.length > 7) {
                formattedValue += '-' + value.substring(7, Math.min(9, value.length));
            }

            if (value.length > 9) {
                formattedValue += '-' + value.substring(9, 11);
            }

            // Устанавливаем новое значение
            e.target.value = formattedValue;

            // Корректируем позицию курсора после форматирования
            const newLength = formattedValue.length;
            const diff = newLength - initialLength;

            // Если мы удаляем символы, перемещаем курсор после разделителя
            if (diff < 0 && cursorPosition > 0) {
                cursorPosition = Math.max(0, cursorPosition + diff);

                // Проверяем, не находится ли курсор на разделителе
                const nextChar = formattedValue.charAt(cursorPosition);
                if (nextChar === ' ' || nextChar === '(' || nextChar === ')' || nextChar === '-') {
                    cursorPosition = Math.max(0, cursorPosition - 1);
                }
            }
            // Если добавляем символы, перемещаем курсор вперед
            else if (diff > 0) {
                cursorPosition += diff;

                // Если после форматирования курсор на разделителе, перемещаем его вперед
                if (cursorPosition < formattedValue.length) {
                    const nextChar = formattedValue.charAt(cursorPosition);
                    if (nextChar === ' ' || nextChar === '(' || nextChar === ')' || nextChar === '-') {
                        cursorPosition++;
                    }
                }
            }

            // Устанавливаем позицию курсора
            e.target.setSelectionRange(cursorPosition, cursorPosition);
        });

        // Установка значения по умолчанию и начальной подсказки
        inputElement.addEventListener('focus', function (e) {
            if (!e.target.value) {
                e.target.value = '+7 (';
                e.target.setSelectionRange(4, 4);
            }
        });

        // Валидация номера при потере фокуса
        inputElement.addEventListener('blur', function (e) {
            const phonePattern = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;

            if (!phonePattern.test(e.target.value) && e.target.value !== '') {
                if (errorElement) {
                    errorElement.textContent = 'Введите полный номер телефона';
                    errorElement.classList.add('show');
                }
                e.target.classList.add('invalid');
            } else {
                if (errorElement) {
                    errorElement.classList.remove('show');
                }
                e.target.classList.remove('invalid');
            }
        });
    }

    // Настройка ввода телефона для формы регистрации
    const registerPhoneInput = document.getElementById('register-phone');
    const registerPhoneError = document.getElementById('phone-error');
    setupPhoneInput(registerPhoneInput, registerPhoneError);

    // Настройка ввода телефона для формы входа
    const loginPhoneInput = document.getElementById('login-phone');
    const loginPhoneError = document.getElementById('login-phone-error');
    setupPhoneInput(loginPhoneInput, loginPhoneError);

    // Валидация совпадения паролей
    const passwordInput = document.getElementById('register-password');
    const confirmPasswordInput = document.getElementById('register-confirm-password');
    const passwordError = document.getElementById('password-error');

    confirmPasswordInput.addEventListener('blur', function () {
        if (passwordInput.value !== confirmPasswordInput.value) {
            passwordError.textContent = 'Пароли не совпадают';
            passwordError.classList.add('show');
        } else {
            passwordError.classList.remove('show');
        }
    });

    // Обработка отправки форм
    const loginFormElement = document.getElementById('login-form');
    const registerFormElement = document.getElementById('registration-form');


    loginFormElement.addEventListener('submit', function (e) {
        e.preventDefault();

        // Валидация телефона
        const phonePattern = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
        if (!phonePattern.test(loginPhoneInput.value)) {
            loginPhoneError.textContent = 'Введите корректный номер телефона';
            loginPhoneError.classList.add('show');
            loginPhoneInput.focus();
            return;
        }
        loginPhoneError.textContent = '';
        loginPhoneError.classList.remove('show');

        const phone = loginPhoneInput.value;
        const password = document.getElementById('login-password').value;

        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ phone, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                // Успешный вход — перенаправляем
                window.location.href = '/account';
            } else if (data.error) {
                alert('Ошибка входа: ' + data.error);
            }
        })
        .catch(err => {
            console.error('Ошибка при отправке запроса', err);
            alert('Ошибка сети. Попробуйте позже.');
        });
    });


    registerFormElement.addEventListener('submit', function (e) {
    e.preventDefault();
    console.log('Отправка формы регистрации');

    const messageContainer = document.getElementById('register-message');
    messageContainer.textContent = ''; // очистка перед новой попыткой
    messageContainer.classList.remove('success');

    // Валидация телефона перед отправкой
    const phonePattern = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
    const registerPhoneInput = document.getElementById('register-phone');
    const registerPhoneError = document.getElementById('phone-error');
    const passwordInput = document.getElementById('register-password');
    const confirmPasswordInput = document.getElementById('register-confirm-password');
    const passwordError = document.getElementById('password-error');

    if (!phonePattern.test(registerPhoneInput.value)) {
        registerPhoneError.textContent = 'Введите корректный номер телефона';
        messageContainer.textContent = 'Введите корректный номер телефона';
        registerPhoneError.classList.add('show');
        registerPhoneInput.focus();
        return;
    }

    if (passwordInput.value !== confirmPasswordInput.value) {
        passwordError.textContent = 'Пароли не совпадают';
        messageContainer.textContent = 'Пароли не совпадают';
        passwordError.classList.add('show');
        confirmPasswordInput.focus();
        return;
    }

    // Формируем FormData из формы
    const formData = new FormData(registerFormElement);

    fetch('/register', {
        method: 'POST',
        body: formData // отправляем formData без указания Content-Type
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            messageContainer.textContent = data.message || 'Регистрация успешно завершена!';
            messageContainer.classList.add('success');
            setTimeout(() => {
                window.location.href = data.redirect || '/account';
            }, 2000);
        } else {
            messageContainer.textContent = data.error || 'Произошла ошибка регистрации';
            messageContainer.classList.remove('success');
        }
    })
    .catch(err => {
        messageContainer.textContent = 'Ошибка регистрации: ' + err.message;
        messageContainer.classList.remove('success');
    });

    console.log('Данные регистрации отправлены');
});
});