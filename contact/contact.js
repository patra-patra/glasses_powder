//Простой JS для FAQ — сворачивание/разворачивание ответов
document.querySelectorAll(".faq-question").forEach((question) => {
    question.addEventListener("click", () => {
        const answer = question.nextElementSibling;
        const icon = question.querySelector("i");
        if (answer.style.maxHeight) {
            answer.style.maxHeight = null;
            icon.classList.remove("fa-chevron-up");
            icon.classList.add("fa-chevron-down");
        } else {
            answer.style.maxHeight = answer.scrollHeight + "px";
            icon.classList.remove("fa-chevron-down");
            icon.classList.add("fa-chevron-up");
        }
    });
});
