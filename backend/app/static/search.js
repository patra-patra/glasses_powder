document.addEventListener('DOMContentLoaded', function () {
    const searchMenu = document.getElementById('searchMenu');
    const searchBlock = document.getElementById('searchBlock');

    let justOpened = false;

    //Показать поиск при клике по пункту меню
    searchMenu.addEventListener('click', function (e) {
        e.preventDefault();
        searchBlock.style.display = 'block';
        searchBlock.querySelector('.search-input').focus();
        justOpened = true;
    });

    //Закрытие поиска при клике вне поисковой формы
    document.addEventListener('click', function (e) {
        if (justOpened) {
            justOpened = false;
            return;
        }
        if (!searchBlock.contains(e.target) && e.target !== searchMenu) {
            searchBlock.style.display = 'none';
        }
    });

    //Предотвращаем закрытие при клике внутри блока
    searchBlock.addEventListener('click', function (e) {
        e.stopPropagation();
    });
});