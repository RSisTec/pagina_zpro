// Variáveis globais
let videoStream;
let video;
let canvas;
let captureBtn;
let newPhotoBtn;
let countdownElement;
let resultContainer;
let capturedPhotoElement;
let qrcodeElement;
let statusMessage;
let photoData = [];

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Elementos do DOM
    video = document.getElementById('camera');
    canvas = document.getElementById('canvas');
    captureBtn = document.getElementById('capture-btn');
    newPhotoBtn = document.getElementById('new-photo-btn');
    countdownElement = document.getElementById('countdown');
    resultContainer = document.getElementById('result-container');
    capturedPhotoElement = document.getElementById('captured-photo');
    qrcodeElement = document.getElementById('qrcode');
    statusMessage = document.getElementById('status-message');

    // Iniciar a câmera
    initCamera();

    // Carregar fotos do localStorage
    loadPhotosFromStorage();

    // Event listeners
    captureBtn.addEventListener('click', startCountdown);
    newPhotoBtn.addEventListener('click', resetCamera);
});

// Função para iniciar a câmera
async function initCamera() {
    try {
        // Solicitar acesso à câmera
        videoStream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user'
            },
            audio: false
        });

        // Conectar o stream ao elemento de vídeo
        video.srcObject = videoStream;
        
        // Exibir mensagem de sucesso
        showStatus('Câmera iniciada com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao acessar a câmera:', error);
        showStatus('Erro ao acessar a câmera. Verifique as permissões do navegador.', 'error');
    }
}

// Função para iniciar a contagem regressiva
function startCountdown() {
    // Desabilitar o botão durante a contagem
    captureBtn.disabled = true;
    
    // Exibir o elemento de contagem
    countdownElement.style.display = 'block';
    
    // Iniciar contagem de 3
    let count = 3;
    countdownElement.textContent = count;
    
    // Atualizar a contagem a cada segundo
    const countdownInterval = setInterval(() => {
        count--;
        
        if (count > 0) {
            countdownElement.textContent = count;
        } else {
            // Quando a contagem chegar a zero, tirar a foto
            clearInterval(countdownInterval);
            countdownElement.textContent = '';
            countdownElement.style.display = 'none';
            capturePhoto();
        }
    }, 1000);
}

// Função para capturar a foto
function capturePhoto() {
    // Configurar o canvas com as dimensões do vídeo
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    
    // Desenhar o frame atual do vídeo no canvas
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, videoWidth, videoHeight);
    
    // Adicionar a moldura à imagem (simulação - na prática, a moldura já está visualmente sobreposta)
    // Aqui poderíamos desenhar uma moldura no canvas se necessário
    
    // Converter para base64
    const imageDataUrl = canvas.toDataURL('image/png');
    
    // Exibir a imagem capturada
    capturedPhotoElement.src = imageDataUrl;
    
    // Ocultar a câmera e mostrar o resultado
    document.querySelector('.camera-container').style.display = 'none';
    resultContainer.style.display = 'block';
    
    // Mostrar o botão de nova foto
    captureBtn.style.display = 'none';
    newPhotoBtn.style.display = 'inline-block';
    
    // Salvar a foto no localStorage
    savePhoto(imageDataUrl);
    
    // Gerar QR code
    generateQRCode(imageDataUrl);
}

// Função para salvar a foto no localStorage
function savePhoto(imageDataUrl) {
    try {
        // Criar objeto com dados da foto
        const photoObj = {
            id: Date.now().toString(),
            timestamp: new Date().toLocaleString(),
            imageData: imageDataUrl
        };
        
        // Adicionar à lista de fotos
        photoData.push(photoObj);
        
        // Salvar no localStorage (apenas os IDs para economizar espaço)
        localStorage.setItem('photoBoothPhotos', JSON.stringify(photoData.map(p => p.id)));
        
        // Salvar cada foto individualmente
        localStorage.setItem(`photo_${photoObj.id}`, JSON.stringify(photoObj));
        
        showStatus('Foto salva com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao salvar foto:', error);
        showStatus('Erro ao salvar foto. O armazenamento local pode estar cheio.', 'error');
    }
}

// Função para carregar fotos do localStorage
function loadPhotosFromStorage() {
    try {
        // Carregar lista de IDs
        const photoIds = JSON.parse(localStorage.getItem('photoBoothPhotos')) || [];
        
        // Limpar array atual
        photoData = [];
        
        // Carregar cada foto individualmente
        for (const id of photoIds) {
            const photoObj = JSON.parse(localStorage.getItem(`photo_${id}`));
            if (photoObj) {
                photoData.push(photoObj);
            }
        }
        
        console.log(`Carregadas ${photoData.length} fotos do armazenamento local.`);
    } catch (error) {
        console.error('Erro ao carregar fotos:', error);
    }
}

// Função para gerar QR code
function generateQRCode(imageDataUrl) {
    // Limpar o elemento QR code
    qrcodeElement.innerHTML = '';
    
    // Criar um ID único para a foto
    const photoId = Date.now().toString();
    
    // URL para acessar a foto (neste caso, usamos um link para a página atual com um parâmetro de ID)
    const photoUrl = `${window.location.origin}${window.location.pathname}?view=${photoId}`;
    
    // Criar o QR code
    new QRCode(qrcodeElement, {
        text: photoUrl,
        width: 200,
        height: 200,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}

// Função para reiniciar a câmera
function resetCamera() {
    // Mostrar a câmera novamente
    document.querySelector('.camera-container').style.display = 'block';
    resultContainer.style.display = 'none';
    
    // Restaurar os botões
    captureBtn.style.display = 'inline-block';
    captureBtn.disabled = false;
    newPhotoBtn.style.display = 'none';
    
    // Limpar o status
    statusMessage.textContent = '';
    statusMessage.className = 'status-message';
}

// Função para exibir mensagens de status
function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    
    // Limpar a mensagem após alguns segundos (exceto para erros)
    if (type !== 'error') {
        setTimeout(() => {
            statusMessage.textContent = '';
            statusMessage.className = 'status-message';
        }, 5000);
    }
}

// Função para enviar a foto para uma API externa (se necessário)
async function uploadPhotoToAPI(imageDataUrl) {
    try {
        showStatus('Enviando foto para o servidor...', 'info');
        
        // Criar FormData
        const formData = new FormData();
        
        // Converter base64 para Blob
        const blob = await fetch(imageDataUrl).then(res => res.blob());
        
        // Adicionar a imagem ao FormData
        formData.append('photo', blob, 'photo.png');
        
        // Enviar para a API
        const response = await fetch('https://sua-api-externa.com/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            showStatus('Foto enviada com sucesso!', 'success');
            return data;
        } else {
            throw new Error(data.error || 'Erro desconhecido');
        }
    } catch (error) {
        console.error('Erro ao enviar foto:', error);
        showStatus(`Erro ao enviar foto: ${error.message}`, 'error');
        return null;
    }
}

// Verificar se há um parâmetro de visualização na URL
function checkForViewParameter() {
    const urlParams = new URLSearchParams(window.location.search);
    const viewId = urlParams.get('view');
    
    if (viewId) {
        // Tentar carregar a foto do localStorage
        try {
            const photoObj = JSON.parse(localStorage.getItem(`photo_${viewId}`));
            if (photoObj) {
                // Exibir a foto
                capturedPhotoElement.src = photoObj.imageData;
                
                // Ocultar a câmera e mostrar o resultado
                document.querySelector('.camera-container').style.display = 'none';
                resultContainer.style.display = 'block';
                
                // Mostrar o botão de nova foto
                captureBtn.style.display = 'none';
                newPhotoBtn.style.display = 'inline-block';
                
                showStatus('Visualizando foto compartilhada.', 'info');
            }
        } catch (error) {
            console.error('Erro ao carregar foto para visualização:', error);
        }
    }
}

// Verificar parâmetros de URL ao carregar
window.addEventListener('DOMContentLoaded', checkForViewParameter);
