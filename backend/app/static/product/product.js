document.addEventListener('DOMContentLoaded', function() {
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
});