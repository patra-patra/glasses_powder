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

// Ïðèìåð èñïîëüçîâàíèÿ ïðè ïîèñêå
document.querySelector('.search-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const searchQuery = document.querySelector('.search-input').value.toLowerCase();

    // Ëîãèêà ïîèñêà òîâàðîâ
    const foundProducts = [...document.querySelectorAll('.product-card')]
        .filter(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('p').textContent.toLowerCase();
            return title.includes(searchQuery) || description.includes(searchQuery);
        });

    // Ïîêàçàòü çàãëóøêó, åñëè íè÷åãî íå íàéäåíî
    showEmptyMessage(foundProducts.length === 0);
});