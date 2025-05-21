// Configurações
const API_URL = "https://webhook.serrafstore.com/webhook/quiz"; // Substitua pela URL real da API
const REDIRECT_URL = "https://serraf.com.br/quiz/"; // Substitua pela URL de redirecionamento
const REDIRECT_DELAY = 5000; // 5 segundos em milissegundos

// Elementos do DOM
const loadingElement = document.getElementById("loading");
const quizContentElement = document.getElementById("quiz-content");
const questionTextElement = document.getElementById("question-text");
const questionImageContainer = document.getElementById("question-image-container");
const questionImageElement = document.getElementById("question-image");
const optionsContainer = document.getElementById("options-container");
const optionButtons = document.querySelectorAll(".option-btn");
const resultContainer = document.getElementById("result-container");
const correctAnswerElement = document.getElementById("correct-answer");
const wrongAnswerElement = document.getElementById("wrong-answer");
const countdownElement = document.getElementById("countdown");

// Variáveis de estado
let currentQuestion = null;
let selectedOptionIndex = null;
let countdownInterval = null;

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
    fetchQuestion();
});

// Buscar pergunta da API
async function fetchQuestion() {
    try {
        showLoading(true);
        
        // Simulação de chamada à API - substitua pelo código real de chamada à API
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status}`);
        }
        
        const data = await response.json();
        currentQuestion = data;
        
        displayQuestion();
    } catch (error) {
        console.error("Erro ao buscar pergunta:", error);
        questionTextElement.textContent = "Erro ao carregar a pergunta. Por favor, tente novamente mais tarde.";
        showLoading(false);
        showQuizContent(true);
    }
}

// Exibir pergunta e opções
function displayQuestion() {
    if (!currentQuestion) return;
    
    // Exibir texto da pergunta
    questionTextElement.textContent = currentQuestion.pergunta;
    
    // Verificar e exibir imagem se existir
    if (currentQuestion.url && currentQuestion.url.trim() !== "") {
        questionImageElement.src = currentQuestion.url;
        questionImageContainer.classList.remove("hidden");
    } else {
        questionImageContainer.classList.add("hidden");
    }
    
    // Exibir opções de resposta
    optionButtons.forEach((button, index) => {
        button.textContent = currentQuestion.respostas[index];
        button.classList.remove("selected", "correct", "incorrect");
        button.disabled = false;
        
        // Adicionar evento de clique
        button.onclick = () => selectOption(index);
    });
    
    // Esconder resultado anterior
    resultContainer.classList.add("hidden");
    correctAnswerElement.classList.add("hidden");
    wrongAnswerElement.classList.add("hidden");
    
    // Mostrar conteúdo do quiz e esconder loading
    showLoading(false);
    showQuizContent(true);
}

// Selecionar uma opção
function selectOption(index) {
    // Limpar seleção anterior
    optionButtons.forEach(button => {
        button.classList.remove("selected");
    });
    
    // Marcar nova seleção
    optionButtons[index].classList.add("selected");
    selectedOptionIndex = index;
    
    // Verificar resposta
    checkAnswer();
}

// Verificar se a resposta está correta
function checkAnswer() {
    if (selectedOptionIndex === null) return;
    
    // Desabilitar todos os botões após a seleção
    optionButtons.forEach(button => {
        button.disabled = true;
    });
    
    const correctIndex = currentQuestion.respostas.findIndex(
        (_, i) => i === currentQuestion.correta
    );
    
    const isCorrect = selectedOptionIndex === correctIndex;
    
    // Marcar resposta correta e incorreta
    optionButtons[correctIndex].classList.add("correct");
    
    if (!isCorrect) {
        optionButtons[selectedOptionIndex].classList.add("incorrect");
    }
    
    // Mostrar mensagem de resultado
    resultContainer.classList.remove("hidden");
    
    if (isCorrect) {
        correctAnswerElement.classList.remove("hidden");
        wrongAnswerElement.classList.add("hidden");
    } else {
        correctAnswerElement.classList.add("hidden");
        wrongAnswerElement.classList.remove("hidden");
    }
    
    // Iniciar contagem regressiva para redirecionamento
    startRedirectCountdown();
}

// Iniciar contagem regressiva para redirecionamento
function startRedirectCountdown() {
    let secondsLeft = REDIRECT_DELAY / 1000;
    countdownElement.textContent = secondsLeft;
    
    countdownInterval = setInterval(() => {
        secondsLeft--;
        countdownElement.textContent = secondsLeft;
        
        if (secondsLeft <= 0) {
            clearInterval(countdownInterval);
            redirectToNextPage();
        }
    }, 1000);
}

// Redirecionar para a próxima página
function redirectToNextPage() {
    window.location.href = REDIRECT_URL;
}

// Utilitários para mostrar/esconder elementos
function showLoading(show) {
    loadingElement.classList.toggle("hidden", !show);
}

function showQuizContent(show) {
    quizContentElement.classList.toggle("hidden", !show);
}

// Função para simular resposta da API para testes
// Remova ou comente esta função antes de usar em produção
function mockApiResponse() {
    return {
        pergunta: "Qual é a capital do Brasil?",
        respostas: ["Rio de Janeiro", "São Paulo", "Brasília", "Salvador"],
        correta: 2, // Índice da resposta correta (Brasília)
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Congresso_Nacional_do_Brasil.jpg/320px-Congresso_Nacional_do_Brasil.jpg"
    };
}

// Para testes locais sem API, descomente a linha abaixo e comente a função fetchQuestion
// document.addEventListener("DOMContentLoaded", () => {
//     currentQuestion = mockApiResponse();
//     displayQuestion();
// });
