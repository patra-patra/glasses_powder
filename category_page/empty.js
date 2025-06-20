// Пример функции для отображения заглушки при пустых результатах
function showEmptyMessage(show) {
    const emptyMessage = document.querySelector('.empty-message');
    const productCards = document.querySelectorAll('.product-card');

    if (show) {
        emptyMessage.style.display = 'flex';
        productCards.forEach(card => card.style.display = 'none');
    } else {
        emptyMessage.style.display = 'none';
        productCards.forEach(card => card.style.display = 'block');
    }
}

// Пример использования при поиске
document.querySelector('.search-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const searchQuery = document.querySelector('.search-input').value.toLowerCase();

    // Логика поиска товаров
    const foundProducts = [...document.querySelectorAll('.product-card')]
        .filter(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('p').textContent.toLowerCase();
            return title.includes(searchQuery) || description.includes(searchQuery);
        });

    // Показать заглушку, если ничего не найдено
    showEmptyMessage(foundProducts.length === 0);
});