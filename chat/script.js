const firebaseConfig = {
    apiKey: "AIzaSyBLAe1zurpP_c0MI8i8ZuzfA8cS8JEqi6o",
    authDomain: "chat-576bf.firebaseapp.com",
    projectId: "chat-576bf",
    storageBucket: "chat-576bf.appspot.com",
    messagingSenderId: "1026923155761",
    appId: "1:1026923155761:web:ce2a0e9b7faffdc54c2b6f"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');

sendButton.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (message) {
        db.collection('messages').add({
            text: message,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        messageInput.value = '';
    }
});

db.collection('messages')
    .orderBy('timestamp')
    .onSnapshot((snapshot) => {
        messagesDiv.innerHTML = '';
        snapshot.forEach((doc) => {
            const data = doc.data();
            const messageEl = document.createElement('div');
            messageEl.textContent = data.text;
            messagesDiv.appendChild(messageEl);
        });
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });
