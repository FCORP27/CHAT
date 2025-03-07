document.getElementById('uploadButton').addEventListener('click', () => {
    document.getElementById('fileInput').click();
});

document.getElementById('fileInput').addEventListener('change', (event) => {
    const files = event.target.files;
    if (files.length > 0) {
        uploadFiles(files);
    }
});

async function uploadFiles(files) {
    const token = prompt('Please enter your GitHub Personal Access Token:');
    const repo = 'jaque26/fotos'; // Reemplaza con tu repo de destino
    const path = 'DCIM/'; // Carpeta en el repo

    for (const file of files) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        await new Promise((resolve) => reader.onload = () => resolve());

        const base64Content = reader.result.split(',')[1];
        const url = `https://api.github.com/repos/${repo}/contents/${path}${file.name}`;

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Subir ${file.name}`,
                content: base64Content
            })
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Error subiendo archivo:', error);
            alert('Error subiendo archivo: ' + file.name);
            return;
        }
    }

    alert('Upload complete!');
}
