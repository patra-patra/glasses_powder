document.addEventListener("DOMContentLoaded", function () {
    // Переключение вкладок в личном кабинете
    const tabLinks = document.querySelectorAll(".account-nav a[data-tab]");
    const tabContents = document.querySelectorAll(".tab-content");

    tabLinks.forEach((link) => {
        link.addEventListener("click", function (e) {
            e.preventDefault();

            tabLinks.forEach((item) =>
                item.parentElement.classList.remove("active")
            );
            tabContents.forEach((item) => item.classList.remove("active"));

            this.parentElement.classList.add("active");
            const tabId = this.getAttribute("data-tab");
            const tabContent = document.getElementById(tabId);
            if (tabContent) {
                tabContent.classList.add("active");
            }

            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    });

    // Функционал редактирования личных данных
    const editBtns = document.querySelectorAll(".edit-btn");
    const cancelBtns = document.querySelectorAll(".cancel-btn");

    editBtns.forEach((btn) => {
        btn.addEventListener("click", function () {
            const formId = this.getAttribute("data-form");
            const form = document.getElementById(formId);
            if (form) {
                const dataBlock = form.previousElementSibling;
                if (dataBlock) dataBlock.style.display = "none";
                form.classList.remove("hidden");
            }
        });
    });

    cancelBtns.forEach((btn) => {
        btn.addEventListener("click", function () {
            const formId = this.getAttribute("data-form");
            const form = document.getElementById(formId);
            if (form) {
                const dataBlock = form.previousElementSibling;
                form.classList.add("hidden");
                if (dataBlock) dataBlock.style.display = "block";
            }
        });
    });

    // Форма смены пароля
    const changePasswordForm = document.getElementById("change-password-form");

    if (changePasswordForm) {
        changePasswordForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const currentPassword = document.getElementById("current-password")?.value || "";
            const newPassword = document.getElementById("new-password")?.value || "";
            const confirmPassword = document.getElementById("confirm-password")?.value || "";

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
    }

    // Добавление нового адреса
    const addAddressBtn = document.getElementById("add-address-btn");
    const addressForm = document.getElementById("address-form");
    const cancelAddressBtn = document.getElementById("cancel-address-btn");

    if (addAddressBtn && addressForm) {
        addAddressBtn.addEventListener("click", function () {
            addressForm.classList.remove("hidden");
            addressForm.scrollIntoView({ behavior: "smooth" });
        });
    }

    if (cancelAddressBtn && addressForm) {
        cancelAddressBtn.addEventListener("click", function () {
            addressForm.classList.add("hidden");
        });
    }

    // Обновление личных данных
    const forms = document.querySelectorAll("form");
    forms.forEach((form) => {
        form.addEventListener("submit", async function (e) {
            if (form.id === "change-password-form" || form.id === "address-form") return;
            e.preventDefault();

            const formData = {
                first_name: document.getElementById("firstname")?.value || "",
                last_name: document.getElementById("lastname")?.value || "",
                phone: document.getElementById("phone")?.value || "",
                birthdate: document.getElementById("birthdate")?.value || "",
            };

            try {
                const response = await fetch("/update_profile", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                });

                let result = {};
                try {
                    result = await response.json();
                } catch {}

                if (response.ok) {
                    showNotification("Данные успешно сохранены!");
                    const dataBlock = form.previousElementSibling;
                    form.classList.add("hidden");
                    if (dataBlock) {
                        dataBlock.style.display = "block";
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
    });

    // Функция уведомлений
    function showNotification(message) {
        let notification = document.querySelector(".cart-notification");
        if (!notification) {
            notification = document.createElement("div");
            notification.className = "cart-notification";
            notification.style.position = "fixed";
            notification.style.top = "20px";
            notification.style.left = "50%";
            notification.style.transform = "translateX(-50%)";
            notification.style.backgroundColor = "#e57373";
            notification.style.color = "#fff";
            notification.style.padding = "10px 20px";
            notification.style.borderRadius = "10px";
            notification.style.zIndex = "9999";
            notification.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
            notification.style.transition = "opacity 0.3s ease";
            document.body.appendChild(notification);
        }

        notification.textContent = message;
        notification.style.opacity = "1";

        setTimeout(() => {
            notification.style.opacity = "0";
            setTimeout(() => {
                if (notification && notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 2000);
    }

    // Поиск
    const searchMenu = document.getElementById("searchMenu");
    const searchBlock = document.getElementById("searchBlock");

    if (searchMenu && searchBlock) {
        searchMenu.addEventListener("click", function (e) {
            e.preventDefault();
            if (searchBlock.style.display === "none" || searchBlock.style.display === "") {
                searchBlock.style.display = "block";
            } else {
                searchBlock.style.display = "none";
                const searchInput = searchBlock.querySelector(".search-input");
                if (searchInput) {
                    searchInput.value = "";
                }
            }
        });

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

    // Адреса
    const addressItems = document.querySelectorAll(".address-item");
    addressItems.forEach((item) => {
        const editBtn = item.querySelector(".btn-outline");
        const deleteBtn = item.querySelector(".btn-secondary");

        editBtn?.addEventListener("click", () => {
            const id = item.dataset.addressId;
            const street = item.querySelector("p:nth-child(1)")?.textContent.split(": ")[1] || "";
            const city = item.querySelector("p:nth-child(2)")?.textContent.split(": ")[1] || "";
            const postal = item.querySelector("p:nth-child(3)")?.textContent.split(": ")[1] || "";

            const streetInput = document.getElementById("street");
            const cityInput = document.getElementById("city");
            const postalInput = document.getElementById("postal_code");
            const addressIdInput = document.getElementById("address-id");

            if (streetInput && cityInput && postalInput && addressIdInput && addressForm) {
                addressIdInput.value = id;
                streetInput.value = street;
                cityInput.value = city;
                postalInput.value = postal;

                addressForm.classList.remove("hidden");
                addressForm.scrollIntoView({ behavior: "smooth" });
            }
        });

        deleteBtn?.addEventListener("click", () => {
            const id = item.dataset.addressId;
            if (confirm("Удалить этот адрес?")) {
                fetch(`/delete_address/${id}`, { method: "POST" })
                    .then((res) => {
                        if (res.ok) location.reload();
                        else showNotification("Ошибка при удалении адреса");
                    });
            }
        });
    });

    if (addressForm) {
        addressForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const id = document.getElementById("address-id")?.value || null;
            const data = {
                street: document.getElementById("street")?.value || "",
                city: document.getElementById("city")?.value || "",
                postal_code: document.getElementById("postal_code")?.value || "",
            };
            const url = id ? `/edit_address/${id}` : "/add_address";

            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                location.reload();
            } else {
                showNotification("Ошибка при сохранении адреса");
            }
        });
    }
});
