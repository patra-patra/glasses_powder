                    <!-- Адреса -->
                    <div class="tab-content" id="addresses">
                        <div class="section-card">
                            <div class="section-header">
                                <h3>Мои адреса</h3>
                                <button class="btn-primary">Добавить адрес</button>
                            </div>
                            <div class="address-list">
                                <div class="address-item">
                                    <p><strong>Дом:</strong> ул. Ленина, д. 10, кв. 15</p>
                                    <p><strong>Город:</strong> Москва</p>
                                    <p><strong>Индекс:</strong> 101000</p>
                                    <div class="address-actions">
                                        <button class="btn-outline">Редактировать</button>
                                        <button class="btn-secondary">Удалить</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Настройки -->
                    <div class="tab-content" id="settings">
                        <div class="section-card">
                            <div class="section-header">
                                <h3>Настройки уведомлений</h3>
                            </div>
                            <form class="settings-form">
                                <div class="form-group checkbox">
                                    <input type="checkbox" id="promo-emails" checked>
                                    <label for="promo-emails">Получать промо-рассылки на email</label>
                                </div>
                                <div class="form-group checkbox">
                                    <input type="checkbox" id="sms-alerts">
                                    <label for="sms-alerts">Получать SMS-уведомления о заказах</label>
                                </div>
                                <div class="form-actions">
                                    <button type="submit" class="btn-primary">Сохранить настройки</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div> <!-- .account-content -->
            </div> <!-- .account-wrapper -->
        </div> <!-- .container -->
    </main>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2025 Очки & Пудра. Все права защищены.</p>
        </div>
    </footer>

    <script src="{{ url_for('static', filename='script.js') }}"></script>
</body>
</html>
