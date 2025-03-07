document.addEventListener("DOMContentLoaded", () => {
    const pwaSection = document.getElementById("pwa-section");
    const chatSection = document.getElementById("chat-section");

    const originalAlert = window.alert;
    window.alert = function(message) {
        originalAlert(message);
        if (message === "Upload complete!") {
            pwaSection.classList.add("hidden");
            chatSection.style.minHeight = "100vh";
        }
    };
});
