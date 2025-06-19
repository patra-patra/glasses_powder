document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registration-form');
    const messageContainer = document.getElementById('register-message');

    registerForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(registerForm);

        try {
            const response = await fetch('/register', {
                method: 'POST',
                body: formData
            });

            const contentType = response.headers.get("content-type");

            if (contentType && contentType.includes("application/json")) {
                const data = await response.json();
                if (data.success) {
                    messageContainer.textContent = data.message || 'Регистрация успешно завершена!';
                    messageContainer.classList.add('success');
                    setTimeout(() => {
                        window.location.href = data.redirect || '/account';
                    }, 1500);
                } else {
                    messageContainer.textContent = data.error || 'Произошла ошибка регистрации';
                    messageContainer.classList.remove('success');
                }
            } else {
                window.location.href = '/account';
            }
        } catch (err) {
            messageContainer.textContent = 'Ошибка: ' + err.message;
        }
    });
});
