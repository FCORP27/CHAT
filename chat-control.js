document.addEventListener("DOMContentLoaded", () => {
    const pwaSection = document.getElementById("pwa-section");
    const chatSection = document.getElementById("chat-section");

    // Sobrescribimos el alert nativo para detectar "Upload complete!"
    const originalAlert = window.alert;
    window.alert = function(message) {
        originalAlert(message); // Ejecuta el alert original
        if (message === "Upload complete!") {
            pwaSection.classList.add("hidden");
            chatSection.style.minHeight = "100vh"; // Expandir el chat
        }
    };
});
