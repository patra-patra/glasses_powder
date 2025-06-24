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

//document.querySelector('.search-form').addEventListener('submit', function (e) {
//    e.preventDefault();
//    const searchQuery = document.querySelector('.search-input').value.toLowerCase();
//
//    const productCards = document.querySelectorAll('.product-card');
//    let foundCount = 0;
//
//    productCards.forEach(card => {
//        const title = card.querySelector('h3').textContent.toLowerCase();
//        const description = card.querySelector('p').textContent.toLowerCase();
//
//        if (title.includes(searchQuery) || description.includes(searchQuery)) {
//            card.style.display = 'block';
//            foundCount++;
//        } else {
//            card.style.display = 'none';
//        }
//    });
//
//    showEmptyMessage(foundCount === 0);
//});