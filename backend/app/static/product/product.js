document.addEventListener('DOMContentLoaded', function() {
    //Переключение миниатюр в галерее
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.getElementById('main-product-image');

    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            //Удаляем активный класс у всех миниатюр
            thumbnails.forEach(item => item.classList.remove('active'));

            //Добавляем активный класс текущей миниатюре
            this.classList.add('active');

            //Обновляем основное изображение
            const imageUrl = this.getAttribute('data-image');
            mainImage.src = imageUrl;
        });
    });

    //Управление количеством товара
    const minusBtn = document.querySelector('.quantity-btn.minus');
    const plusBtn = document.querySelector('.quantity-btn.plus');
    const quantityInput = document.querySelector('.quantity-input');

    minusBtn.addEventListener('click', function() {
        let currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
        }
    });

    plusBtn.addEventListener('click', function() {
        let currentValue = parseInt(quantityInput.value);
        if (currentValue < 10) {
            quantityInput.value = currentValue + 1;
        }
    });

    //Переключение вкладок
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            //Удаляем активный класс у всех кнопок и панелей
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));

            //Добавляем активный класс текущей кнопке
            this.classList.add('active');

            //Активируем соответствующую панель
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });

    //Добавление в корзину
    const addToCartBtn = document.querySelector('.add-to-cart');

    addToCartBtn.addEventListener('click', function() {
        const productName = document.querySelector('.product-title').textContent;
        const productPrice = document.querySelector('.product-price').textContent;
        const productQuantity = quantityInput.value;
        const productColor = document.querySelector('input[name="color"]:checked').value;
        const productSize = document.querySelector('input[name="size"]:checked').value;

        console.log('Товар добавлен в корзину:', {
            name: productName,
            price: productPrice,
            quantity: productQuantity,
            color: productColor,
            size: productSize
        });

        //Показываем уведомление
        alert('Товар добавлен в корзину!');
    });

    //Кнопка избранного
    const wishlistBtn = document.querySelector('.wishlist');

    wishlistBtn.addEventListener('click', function() {
        const icon = this.querySelector('i');

        if (icon.classList.contains('far')) {
            icon.classList.remove('far');
            icon.classList.add('fas');
            this.style.color = 'var(--primary-color)';
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
            this.style.color = 'var(--text-light)';
        }
    });
});