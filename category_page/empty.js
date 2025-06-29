// ������ �������
const products = [
    {
        id: 1,
        name: "��������� ���� Maybelline Fit Me",
        category: "���������",
        brand: "Maybelline",
        price: 1200,
        country: "���",
        desc: "��������� �������� ��� ������ ���� ����. ������ ��������, ������������ ���������.",
        photonum: "maybelline-foundation.jpg",
        popularity: 95,
        isNew: false
    },
    {
        id: 2,
        name: "�������������� ���� Ray-Ban Aviator",
        category: "����",
        brand: "Ray-Ban",
        price: 8500,
        country: "������",
        desc: "������������ �������������� ���� ������� �������� � UV �������.",
        photonum: "rayban-aviator.jpg",
        popularity: 90,
        isNew: true
    },
    {
        id: 3,
        name: "������ Dior Rouge Lipstick",
        category: "���������",
        brand: "Dior",
        price: 3500,
        country: "�������",
        desc: "��������� ������ � ���������� ������ � ���������� ���������.",
        photonum: "dior-lipstick.jpg",
        popularity: 88,
        isNew: false
    },
    {
        id: 4,
        name: "������ ��� ����� Gucci GG0010O",
        category: "����",
        brand: "Gucci",
        price: 12000,
        country: "������",
        desc: "���������� ������ ��� ������������� ������� �� ����������� ����������.",
        photonum: "gucci-frame.jpg",
        popularity: 85,
        isNew: true
    },
    {
        id: 5,
        name: "���� ��� ������ L'Oreal Voluminous",
        category: "���������",
        brand: "L'Oreal",
        price: 850,
        country: "�������",
        desc: "�������� ���� ��� �������������� �������. �� ���������, ����� ���������.",
        photonum: "loreal-mascara.jpg",
        popularity: 92,
        isNew: false
    },
    {
        id: 6,
        name: "�������������� ���� Prada Sport",
        category: "����",
        brand: "Prada",
        price: 15000,
        country: "������",
        desc: "���������� �������������� ���� � ���������������� �������.",
        photonum: "prada-sport.jpg",
        popularity: 87,
        isNew: true
    },
    {
        id: 7,
        name: "��������� ������ MAC Studio Fix",
        category: "���������",
        brand: "MAC",
        price: 2800,
        country: "������",
        desc: "���������������� ��������� ������ � ������� ���������.",
        photonum: "mac-foundation.jpg",
        popularity: 89,
        isNew: false
    },
    {
        id: 8,
        name: "���� ��� ������ Persol",
        category: "����",
        brand: "Persol",
        price: 9500,
        country: "������",
        desc: "�������� ���� ��� ������ � ������������ ���������.",
        photonum: "persol-reading.jpg",
        popularity: 83,
        isNew: false
    },
    {
        id: 9,
        name: "�������� Maybelline Age Rewind",
        category: "���������",
        brand: "Maybelline",
        price: 950,
        country: "���",
        desc: "����������� �������� ������ ������ ������ ��� �������.",
        photonum: "maybelline-concealer.jpg",
        popularity: 86,
        isNew: false
    },
    {
        id: 10,
        name: "�������������� ���� Tom Ford",
        category: "����",
        brand: "Tom Ford",
        price: 18000,
        country: "������",
        desc: "��������� ������������ �������������� ����.",
        photonum: "tomford-sunglasses.jpg",
        popularity: 91,
        isNew: true
    },
    {
        id: 11,
        name: "������ Chanel Joues Contraste",
        category: "���������",
        brand: "Chanel",
        price: 4200,
        country: "�������",
        desc: "���������� ������ ��� �������� ������������� �������.",
        photonum: "chanel-blush.jpg",
        popularity: 84,
        isNew: false
    },
    {
        id: 12,
        name: "������ Gucci Vintage",
        category: "����",
        brand: "Gucci",
        price: 14500,
        country: "������",
        desc: "��������� ������ � ������������ ����� Gucci.",
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

// �������������
document.addEventListener('DOMContentLoaded', function () {
    displayProducts();
    setupEventListeners();
    updateCartCounter();
});

// ��������� ������������ �������
function setupEventListeners() {
    // �����
    document.getElementById('search-form').addEventListener('submit', function (e) {
        e.preventDefault();
        applyFilters();
    });

    document.getElementById('search-input').addEventListener('input', function () {
        applyFilters();
    });

    // �������
    document.getElementById('apply-filters').addEventListener('click', applyFilters);
    document.getElementById('reset-filters').addEventListener('click', resetFilters);

    // ����������
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            currentSort = this.dataset.sort;
            currentOrder = this.dataset.order;
            sortAndDisplayProducts();
        });
    });

    // ������� � �������� �������
    document.getElementById('brand-filters').addEventListener('change', applyFilters);
    document.getElementById('country-select').addEventListener('change', applyFilters);
    document.getElementById('min-price').addEventListener('input', applyFilters);
    document.getElementById('max-price').addEventListener('input', applyFilters);
}

// ���������� ��������
function applyFilters() {
    const searchQuery = document.getElementById('search-input').value.toLowerCase();
    const selectedBrands = Array.from(document.querySelectorAll('input[name="brand"]:checked'))
        .map(input => input.value);
    const selectedCountry = document.getElementById('country-select').value;
    const minPrice = parseFloat(document.getElementById('min-price').value) || 0;
    const maxPrice = parseFloat(document.getElementById('max-price').value) || Infinity;

    filteredProducts = products.filter(product => {
        // ����� �� �������� � ��������
        const matchesSearch = !searchQuery ||
            product.name.toLowerCase().includes(searchQuery) ||
            product.desc.toLowerCase().includes(searchQuery);

        // ������ �� ������
        const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand);

        // ������ �� ������
        const matchesCountry = !selectedCountry || product.country === selectedCountry;

        // ������ �� ����
        const matchesPrice = product.price >= minPrice && product.price <= maxPrice;

        return matchesSearch && matchesBrand && matchesCountry && matchesPrice;
    });

    currentPage = 1;
    sortAndDisplayProducts();
}

// ����� ��������
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

// ���������� � ����������� �������
function sortAndDisplayProducts() {
    // ����������
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

// ����������� �������
function displayProducts() {
    const productGrid = document.getElementByI
