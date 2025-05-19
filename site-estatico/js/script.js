// Dados dos serviços
const services = [
    {
        title: 'MICRO DE SOBRANCELHA',
        price: 'R$ 419,00',
        duration: '120min',
        description: 'Micropigmentação de sobrancelha para um visual natural e duradouro.'
    },
    {
        title: 'MICRO LABIAL',
        price: 'R$ 389,90',
        duration: '120min',
        description: 'Micropigmentação labial para realçar a cor e definição dos lábios.'
    },
    {
        title: 'COMBO MICROPIGMENTAÇÃO',
        price: 'R$ 789,90',
        duration: '150min',
        description: 'Combo completo incluindo micropigmentação de sobrancelha e labial com preço especial.'
    },
    {
        title: 'PIERCING',
        price: 'Consultar',
        duration: '30min',
        description: 'Aplicação de piercing com joias disponíveis para consulta.'
    },
    {
        title: 'BROW LAMINATION',
        price: 'R$ 130,00',
        duration: '90min',
        description: 'Técnica que alinha e fixa os fios da sobrancelha, criando um efeito natural e volumoso.'
    },
    {
        title: 'HENNA + SPA LABIAL',
        price: 'R$ 70,00',
        duration: '60min',
        description: 'Combinação de design com henna e tratamento especial para os lábios.'
    },
    {
        title: 'DESIGN COM HENNA',
        price: 'R$ 49,90',
        duration: '60min',
        description: 'Design de sobrancelha com aplicação de henna para um efeito mais marcado.'
    },
    {
        title: 'DESIGN SEM HENNA',
        price: 'R$ 35,00',
        duration: '30min',
        description: 'Design de sobrancelha tradicional para realçar o olhar.'
    },
    {
        title: 'FURO HUMANIZADO',
        price: 'R$ 180,00',
        duration: '59min',
        description: 'Técnica de perfuração com abordagem mais suave e confortável.'
    },
    {
        title: 'RETOQUE MICROPIGMENTAÇÃO SOBRANCELHA',
        price: 'R$ 160,00',
        duration: '60min',
        description: 'Retoque para manter a micropigmentação de sobrancelha sempre perfeita.'
    }
];

// Elementos do DOM
const servicesGrid = document.getElementById('services-grid');
const modal = document.getElementById('date-modal');
const modalTitle = document.getElementById('modal-title');
const closeButton = document.querySelector('.close-button');
const datesContainer = document.getElementById('dates-container');
const timeSelection = document.getElementById('time-selection');
const timesContainer = document.getElementById('times-container');
const confirmButton = document.getElementById('confirm-button');

// Variáveis de estado
let selectedService = '';
let selectedDate = null;
let selectedTime = null;

// Gerar cards de serviços
function renderServiceCards() {
    services.forEach(service => {
        const card = document.createElement('div');
        card.className = 'service-card';
        
        card.innerHTML = `
            <div class="card-content">
                <h3 class="card-title">${service.title}</h3>
                <div class="card-details">
                    <p class="price">${service.price}</p>
                    <p class="duration">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        ${service.duration}
                    </p>
                </div>
                <p class="card-description">${service.description}</p>
                <button class="schedule-button" data-service="${service.title}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    Agendar
                </button>
            </div>
        `;
        
        servicesGrid.appendChild(card);
    });
}

// Gerar datas disponíveis (hoje até 8 dias à frente)
function generateAvailableDates() {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 8; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        const formattedDate = date.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        dates.push(formattedDate);
    }
    
    return dates;
}

// Horários disponíveis (exemplo)
const availableTimes = [
    '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

// Renderizar datas no modal
function renderDates() {
    datesContainer.innerHTML = '';
    const dates = generateAvailableDates();
    
    dates.forEach(date => {
        const dateButton = document.createElement('button');
        dateButton.className = 'date-button';
        dateButton.textContent = date;
        dateButton.addEventListener('click', () => {
            // Remover seleção anterior
            document.querySelectorAll('.date-button').forEach(btn => {
                btn.classList.remove('selected');
            });
            
            // Adicionar seleção atual
            dateButton.classList.add('selected');
            selectedDate = date;
            
            // Mostrar seleção de horários
            timeSelection.style.display = 'block';
            
            // Resetar horário selecionado
            selectedTime = null;
            document.querySelectorAll('.time-button').forEach(btn => {
                btn.classList.remove('selected');
            });
            
            // Desabilitar botão de confirmação
            confirmButton.classList.add('disabled');
        });
        
        datesContainer.appendChild(dateButton);
    });
}

// Renderizar horários no modal
function renderTimes() {
    timesContainer.innerHTML = '';
    
    availableTimes.forEach(time => {
        const timeButton = document.createElement('button');
        timeButton.className = 'time-button';
        timeButton.textContent = time;
        timeButton.addEventListener('click', () => {
            // Remover seleção anterior
            document.querySelectorAll('.time-button').forEach(btn => {
                btn.classList.remove('selected');
            });
            
            // Adicionar seleção atual
            timeButton.classList.add('selected');
            selectedTime = time;
            
            // Habilitar botão de confirmação
            confirmButton.classList.remove('disabled');
        });
        
        timesContainer.appendChild(timeButton);
    });
}

// Abrir modal
function openModal(serviceName) {
    selectedService = serviceName;
    modalTitle.textContent = `Agendar ${serviceName}`;
    
    // Resetar seleções
    selectedDate = null;
    selectedTime = null;
    
    // Esconder seleção de horários
    timeSelection.style.display = 'none';
    
    // Renderizar datas e horários
    renderDates();
    renderTimes();
    
    // Desabilitar botão de confirmação
    confirmButton.classList.add('disabled');
    
    // Mostrar modal
    modal.style.display = 'block';
}

// Fechar modal
function closeModal() {
    modal.style.display = 'none';
}

// Confirmar agendamento
function confirmSchedule() {
    if (selectedDate && selectedTime) {
        alert(`Agendamento para ${selectedService} confirmado para ${selectedDate} às ${selectedTime}`);
        closeModal();
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Renderizar cards de serviços
    renderServiceCards();
    
    // Adicionar event listeners para botões de agendamento
    document.querySelectorAll('.schedule-button').forEach(button => {
        button.addEventListener('click', () => {
            const serviceName = button.getAttribute('data-service');
            openModal(serviceName);
        });
    });
    
    // Fechar modal ao clicar no botão de fechar
    closeButton.addEventListener('click', closeModal);
    
    // Fechar modal ao clicar fora do conteúdo
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
    
    // Confirmar agendamento
    confirmButton.addEventListener('click', () => {
        if (!confirmButton.classList.contains('disabled')) {
            confirmSchedule();
        }
    });
});
