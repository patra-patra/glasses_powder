document.addEventListener("DOMContentLoaded", function () {
    //Переключение вкладок в личном кабинете
    const tabLinks = document.querySelectorAll(".account-nav a[data-tab]");
    const tabContents = document.querySelectorAll(".tab-content");

    tabLinks.forEach((link) => {
        link.addEventListener("click", function (e) {
            e.preventDefault();

            //Убираем активный класс у всех пунктов меню и содержимого вкладок
            tabLinks.forEach((item) =>
                item.parentElement.classList.remove("active")
            );
            tabContents.forEach((item) => item.classList.remove("active"));

            //Добавляем активный класс выбранному пункту меню и соответствующей вкладке
            this.parentElement.classList.add("active");
            const tabId = this.getAttribute("data-tab");
            document.getElementById(tabId).classList.add("active");

            //Прокручиваем страницу вверх
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    });

    //Функционал редактирования личных данных
    const editBtns = document.querySelectorAll(".edit-btn");
    const cancelBtns = document.querySelectorAll(".cancel-btn");

    editBtns.forEach((btn) => {
        btn.addEventListener("click", function () {
            const formId = this.getAttribute("data-form");
            const form = document.getElementById(formId);
            const dataBlock = form.previousElementSibling;

            if (dataBlock) {
              dataBlock.style.display = "none";
            }

            form.classList.remove("hidden");
        });
    });

    const changePasswordForm = document.getElementById("change-password-form");

     changePasswordForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const currentPassword = document.getElementById("current-password").value;
        const newPassword = document.getElementById("new-password").value;
        const confirmPassword = document.getElementById("confirm-password").value;

        if (newPassword !== confirmPassword) {
            showNotification("Пароли не совпадают");
            return;
        }

        fetch("/change_password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword,
            }),
        })
        .then(async (res) => {
            let data;
            try {
                data = await res.json();
            } catch {
                data = {};
            }
            return { ok: res.ok, data };
        })
        .then(({ ok, data }) => {
            if (!ok) {
                showNotification("Ошибка: " + (data.error || "Не удалось изменить пароль"));
            } else {
                showNotification(data.message || "Пароль успешно изменён");
                changePasswordForm.reset();
            }
        })
        .catch((err) => {
            console.error(err);
            showNotification("Произошла ошибка: " + (err.message || "Неизвестная ошибка"));
        });
    });

    cancelBtns.forEach((btn) => {
        btn.addEventListener("click", function () {
            const formId = this.getAttribute("data-form");
            const form = document.getElementById(formId);
            const dataBlock = form.previousElementSibling;

            form.classList.add("hidden");
            if (dataBlock) {
              dataBlock.style.display = "block";
            }
        });
    });

    //Функционал добавления адреса
    const addAddressBtn = document.getElementById("add-address-btn");
    const addressForm = document.getElementById("address-form");
    const cancelAddressBtn = document.getElementById("cancel-address-btn");

    if (addAddressBtn && addressForm) {
        addAddressBtn.addEventListener("click", function () {
            addressForm.classList.remove("hidden");
            //Прокручиваем к форме
            addressForm.scrollIntoView({ behavior: "smooth" });
        });
    }

    if (cancelAddressBtn && addressForm) {
        cancelAddressBtn.addEventListener("click", function () {
            addressForm.classList.add("hidden");
        });
    }

    //Обработка профиля
    const profileForm = document.getElementById("profile-form");
    if (profileForm) {
      profileForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const formData = {
          first_name: document.getElementById("firstname").value,
          last_name: document.getElementById("lastname").value,
          phone: document.getElementById("phone").value,
          birthdate: document.getElementById("birthdate").value,
        };

        try {
          const response = await fetch("/update_profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          });

          const result = await response.json();

          if (response.ok) {
            showNotification("Данные успешно сохранены!");
            //скрыть форму и показать блок с данными
            const dataBlock = profileForm.previousElementSibling;
            profileForm.classList.add("hidden");
            if (dataBlock) dataBlock.style.display = "block";

            if (dataBlock) {
              dataBlock.querySelector(".data-row:nth-child(1) .data-value").textContent = formData.first_name;
              dataBlock.querySelector(".data-row:nth-child(2) .data-value").textContent = formData.last_name;
              dataBlock.querySelector(".data-row:nth-child(3) .data-value").textContent = formData.phone;
              dataBlock.querySelector(".data-row:nth-child(4) .data-value").textContent = formData.birthdate;
            }
          } else {
            showNotification("Ошибка: " + (result.error || "Не удалось обновить данные"));
          }
        } catch (err) {
          console.error(err);
          showNotification("Произошла ошибка: " + (err.message || "Ошибка сети"));
        }
      });
    }

    //Функция для отображения уведомления
    function showNotification(message) {
        //Проверяем, существует ли уже уведомление
        let notification = document.querySelector(".cart-notification");

        //Если нет, создаем новое
        if (!notification) {
            notification = document.createElement("div");
            notification.className = "cart-notification";
            document.body.appendChild(notification);
        }

        notification.textContent = message;

        //Показываем уведомление
        setTimeout(() => {
            notification.classList.add("show");
        }, 100);

        //Скрываем через 2 секунды
        setTimeout(() => {
            notification.classList.remove("show");
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 2000);
    }

    //Функционал поиска
    const searchMenu = document.getElementById("searchMenu");
    const searchBlock = document.getElementById("searchBlock");

    if (searchMenu && searchBlock) {
        searchMenu.addEventListener("click", function (e) {
            e.preventDefault();

            if (
                searchBlock.style.display === "none" ||
                searchBlock.style.display === ""
            ) {
                searchBlock.style.display = "block";
            } else {
                searchBlock.style.display = "none";
                //Очищаем поле ввода при закрытии
                const searchInput = searchBlock.querySelector(".search-input");
                if (searchInput) {
                    searchInput.value = "";
                }
            }
        });

        //Закрываем поиск при клике вне поисковой строки
        document.addEventListener("click", function (e) {
            if (
                !searchMenu.contains(e.target) &&
                !searchBlock.contains(e.target) &&
                searchBlock.style.display === "block"
            ) {
                searchBlock.style.display = "none";
            }
        });
    }
});