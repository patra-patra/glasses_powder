// Данные товаров
const products = [
    {
        id: 1,
        name: "Тональный крем Maybelline Fit Me",
        category: "косметика",
        brand: "Maybelline",
        price: 1200,
        country: "США",
        desc: "Идеальное покрытие для любого типа кожи. Легкая текстура, естественный результат.",
        photonum: "maybelline-foundation.jpg",
        popularity: 95,
        isNew: false
    },
    {
        id: 2,
        name: "Солнцезащитные очки Ray-Ban Aviator",
        category: "очки",
        brand: "Ray-Ban",
        price: 8500,
        country: "Италия",
        desc: "Классические солнцезащитные очки премиум качества с UV защитой.",
        photonum: "rayban-aviator.jpg",
        popularity: 90,
        isNew: true
    },
    {
        id: 3,
        name: "Помада Dior Rouge Lipstick",
        category: "косметика",
        brand: "Dior",
        price: 3500,
        country: "Франция",
        desc: "Роскошная помада с насыщенным цветом и длительным покрытием.",
        photonum: "dior-lipstick.jpg",
        popularity: 88,
        isNew: false
    },
    {
        id: 4,
        name: "Оправа для очков Gucci GG0010O",
        category: "очки",
        brand: "Gucci",
        price: 12000,
        country: "Италия",
        desc: "Элегантная оправа для повседневного ношения из премиальных материалов.",
        photonum: "gucci-frame.jpg",
        popularity: 85,
        isNew: true
    },
    {
        id: 5,
        name: "Тушь для ресниц L'Oreal Voluminous",
        category: "косметика",
        brand: "L'Oreal",
        price: 850,
        country: "Франция",
        desc: "Объемная тушь для выразительного взгляда. Не осыпается, легко смывается.",
        photonum: "loreal-mascara.jpg",
        popularity: 92,
        isNew: false
    },
    {
        id: 6,
        name: "Солнцезащитные очки Prada Sport",
        category: "очки",
        brand: "Prada",
        price: 15000,
        country: "Италия",
        desc: "Спортивные солнцезащитные очки с поляризационными линзами.",
        photonum: "prada-sport.jpg",
        popularity: 87,
        isNew: true
    },
    {
        id: 7,
        name: "Тональная основа MAC Studio Fix",
        category: "косметика",
        brand: "MAC",
        price: 2800,
        country: "Канада",
        desc: "Профессиональная тональная основа с плотным покрытием.",
        photonum: "mac-foundation.jpg",
        popularity: 89,
        isNew: false
    },
    {
        id: 8,
        name: "Очки для чтения Persol",
        category: "очки",
        brand: "Persol",
        price: 9500,
        country: "Италия",
        desc: "Стильные очки для чтения с антибликовым покрытием.",
        photonum: "persol-reading.jpg",
        popularity: 83,
        isNew: false
    },
    {
        id: 9,
        name: "Консилер Maybelline Age Rewind",
        category: "косметика",
        brand: "Maybelline",
        price: 950,
        country: "США",
        desc: "Эффективный консилер против темных кругов под глазами.",
        photonum: "maybelline-concealer.jpg",
        popularity: 86,
        isNew: false
    },
    {
        id: 10,
        name: "Солнцезащитные очки Tom Ford",
        category: "очки",
        brand: "Tom Ford",
        price: 18000,
        country: "Италия",
        desc: "Роскошные дизайнерские солнцезащитные очки.",
        photonum: "tomford-sunglasses.jpg",
        popularity: 91,
        isNew: true
    },
    {
        id: 11,
        name: "Румяна Chanel Joues Contraste",
        category: "косметика",
        brand: "Chanel",
        price: 4200,
        country: "Франция",
        desc: "Элегантные румяна для создания естественного румянца.",
        photonum: "chanel-blush.jpg",
        popularity: 84,
        isNew: false
    },
    {
        id: 12,
        name: "Оправа Gucci Vintage",
        category: "очки",
        brand: "Gucci",
        price: 14500,
        country: "Италия",
        desc: "Винтажная оправа в классическом стиле Gucci.",
        photonum: "gucci-vintage.jpg",
        popularity: 82,
        isNew: false
    }
];

let filteredProducts = [...products];
let currentPage = 1;
const productsPerPage = 6;
let currentSort = 'popularity';
let currentOrder = 'desc';

// Инициализация
document.addEventListener('DOMContentLoaded', function () {
    displayProducts();
    setupEventListeners();
    updateCartCounter();
});

// Настройка обработчиков событий
function setupEventListeners() {
    // Поиск
    document.getElementById('search-form').addEventListener('submit', function (e) {
        e.preventDefault();
        applyFilters();
    });

    document.getElementById('search-input').addEventListener('input', function () {
        applyFilters();
    });

    // Фильтры
    document.getElementById('apply-filters').addEventListener('click', applyFilters);
    document.getElementById('reset-filters').addEventListener('click', resetFilters);

    // Сортировка
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            currentSort = this.dataset.sort;
            currentOrder = this.dataset.order;
            sortAndDisplayProducts();
        });
    });

    // Фильтры в реальном времени
    document.getElementById('brand-filters').addEventListener('change', applyFilters);
    document.getElementById('country-select').addEventListener('change', applyFilters);
    document.getElementById('min-price').addEventListener('input', applyFilters);
    document.getElementById('max-price').addEventListener('input', applyFilters);
}

// Применение фильтров
function applyFilters() {
    const searchQuery = document.getElementById('search-input').value.toLowerCase();
    const selectedBrands = Array.from(document.querySelectorAll('input[name="brand"]:checked'))
        .map(input => input.value);
    const selectedCountry = document.getElementById('country-select').value;
    const minPrice = parseFloat(document.getElementById('min-price').value) || 0;
    const maxPrice = parseFloat(document.getElementById('max-price').value) || Infinity;

    filteredProducts = products.filter(product => {
        // Поиск по названию и описанию
        const matchesSearch = !searchQuery ||
            product.name.toLowerCase().includes(searchQuery) ||
            product.desc.toLowerCase().includes(searchQuery);

        // Фильтр по бренду
        const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand);

        // Фильтр по стране
        const matchesCountry = !selectedCountry || product.country === selectedCountry;

        // Фильтр по цене
        const matchesPrice = product.price >= minPrice && product.price <= maxPrice;

        return matchesSearch && matchesBrand && matchesCountry && matchesPrice;
    });

    currentPage = 1;
    sortAndDisplayProducts();
}

// Сброс фильтров
function resetFilters() {
    document.getElementById('search-input').value = '';
    document.querySelectorAll('input[name="brand"]').forEach(input => input.checked = false);
    document.getElementById('country-select').value = '';
    document.getElementById('min-price').value = '';
    document.getElementById('max-price').value = '';

    filteredProducts = [...products];
    currentPage = 1;
    sortAndDisplayProducts();
}

// Сортировка и отображение товаров
function sortAndDisplayProducts() {
    // Сортировка
    filteredProducts.sort((a, b) => {
        let comparison = 0;

        switch (currentSort) {
            case 'price':
                comparison = a.price - b.price;
                break;
            case 'popularity':
                comparison = a.popularity - b.popularity;
                break;
            case 'new':
                comparison = (a.isNew ? 1 : 0) - (b.isNew ? 1 : 0);
                break;
            default:
                comparison = 0;
        }

        return currentOrder === 'asc' ? comparison : -comparison;
    });

    displayProducts();
}

// Отображение товаров
function displayProducts() {
    const productGrid = document.getElementByI
