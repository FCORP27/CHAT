document.addEventListener("DOMContentLoaded", () => {
    const pwaSection = document.getElementById("pwa-section");
    const chatSection = document.getElementById("chat-section");

    // Escuchar mensajes desde la PWA
    window.addEventListener("message", (event) => {
        if (event.data === "upload-complete") {
            pwaSection.classList.add("hidden");
            chatSection.style.minHeight = "100vh"; // Expandir el chat
        }
    });
});
