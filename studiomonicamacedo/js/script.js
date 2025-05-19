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

// Elementos do DOM para consulta de agendamento
const checkAppointmentBtn = document.getElementById('check-appointment-btn');
const checkModal = document.getElementById('check-modal');
const checkCloseButton = document.getElementById('check-close-button');
const phoneInput = document.getElementById('phone-input');
const searchButton = document.getElementById('search-button');
const phoneForm = document.getElementById('phone-form');
const resultsContainer = document.getElementById('results-container');
const appointmentsList = document.getElementById('appointments-list');
const loadingContainer = document.getElementById('loading-container');
const errorContainer = document.getElementById('error-container');
const errorMessage = document.getElementById('error-message');

// Formatar número de telefone
function formatPhoneNumber(value) {
    if (!value) return value;
    
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    
    if (phoneNumberLength < 3) return phoneNumber;
    if (phoneNumberLength < 7) {
        return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
    }
    
    return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7, 11)}`;
}

// Abrir modal de consulta
function openCheckModal() {
    // Resetar estado do modal
    phoneInput.value = '';
    resultsContainer.style.display = 'none';
    loadingContainer.style.display = 'none';
    errorContainer.style.display = 'none';
    phoneForm.style.display = 'block';
    
    // Mostrar modal
    checkModal.style.display = 'block';
}

// Fechar modal de consulta
function closeCheckModal() {
    checkModal.style.display = 'none';
}

// Buscar agendamentos
async function searchAppointments(phone) {
    // Mostrar loading
    phoneForm.style.display = 'block';
    loadingContainer.style.display = 'block';
    resultsContainer.style.display = 'none';
    errorContainer.style.display = 'none';
    
    try {
        // Simular chamada à API (substitua pelo endpoint real)
        // const response = await fetch(`https://api.seudominio.com/appointments?phone=${phone}`);
        // const data = await response.json();
        
        // Simulação de resposta da API para demonstração
        // Em produção, descomente o código acima e remova esta simulação
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simular delay de rede
        
        const data = simulateApiResponse(phone);
        
        // Esconder loading
        loadingContainer.style.display = 'none';
        
        if (data.appointments && data.appointments.length > 0) {
            // Renderizar resultados
            renderAppointments(data.appointments);
            resultsContainer.style.display = 'block';
        } else {
            // Mostrar mensagem de erro
            errorMessage.textContent = 'Não encontramos agendamentos para este telefone.';
            errorContainer.style.display = 'block';
        }
    } catch (error) {
        // Esconder loading e mostrar erro
        loadingContainer.style.display = 'none';
        errorMessage.textContent = 'Ocorreu um erro ao buscar seus agendamentos. Tente novamente.';
        errorContainer.style.display = 'block';
        console.error('Erro ao buscar agendamentos:', error);
    }
}

// Função para simular resposta da API (remova em produção)
function simulateApiResponse(phone) {
    // Remova esta função em produção e use a chamada real à API
    
    // Simular diferentes respostas baseadas no telefone para demonstração
    if (phone.includes('99999')) {
        return {
            success: true,
            appointments: [
                {
                    id: 1,
                    service: 'MICRO DE SOBRANCELHA',
                    date: '25/05/2025',
                    time: '14:00',
                    status: 'confirmed'
                },
                {
                    id: 2,
                    service: 'DESIGN COM HENNA',
                    date: '10/06/2025',
                    time: '10:30',
                    status: 'pending'
                }
            ]
        };
    } else if (phone.includes('88888')) {
        return {
            success: true,
            appointments: [
                {
                    id: 3,
                    service: 'MICRO LABIAL',
                    date: '22/05/2025',
                    time: '15:30',
                    status: 'cancelled'
                }
            ]
        };
    } else {
        return {
            success: true,
            appointments: []
        };
    }
}

// Renderizar agendamentos
function renderAppointments(appointments) {
    appointmentsList.innerHTML = '';
    
    appointments.forEach(appointment => {
        const item = document.createElement('div');
        item.className = 'appointment-item';
        
        // Determinar classe de status
        let statusClass = '';
        let statusText = '';
        
        switch (appointment.status) {
            case 'confirmed':
                statusClass = 'status-confirmed';
                statusText = 'Confirmado';
                break;
            case 'pending':
                statusClass = 'status-pending';
                statusText = 'Pendente';
                break;
            case 'cancelled':
                statusClass = 'status-cancelled';
                statusText = 'Cancelado';
                break;
            default:
                statusClass = 'status-pending';
                statusText = 'Pendente';
        }
        
        item.innerHTML = `
            <div class="appointment-service">${appointment.service}</div>
            <div class="appointment-datetime">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                ${appointment.date} às ${appointment.time}
            </div>
            <span class="appointment-status ${statusClass}">${statusText}</span>
        `;
        
        appointmentsList.appendChild(item);
    });
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
    
    // Abrir modal de consulta de agendamento
    checkAppointmentBtn.addEventListener('click', openCheckModal);
    
    // Fechar modal de consulta
    checkCloseButton.addEventListener('click', closeCheckModal);
    
    // Fechar modal de consulta ao clicar fora do conteúdo
    window.addEventListener('click', (event) => {
        if (event.target === checkModal) {
            closeCheckModal();
        }
    });
    
    // Formatar telefone durante digitação
    phoneInput.addEventListener('input', (e) => {
        const formattedInput = formatPhoneNumber(e.target.value);
        e.target.value = formattedInput;
    });
    
    // Buscar agendamentos
    searchButton.addEventListener('click', () => {
        const phone = phoneInput.value.trim();
        if (phone.length >= 14) { // Verificar se o telefone tem pelo menos (XX) XXXXX-XXXX
            searchAppointments(phone);
        } else {
            errorMessage.textContent = 'Por favor, digite um número de telefone válido.';
            errorContainer.style.display = 'block';
            resultsContainer.style.display = 'none';
        }
    });
    
    // Permitir busca ao pressionar Enter no campo de telefone
    phoneInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchButton.click();
        }
    });
});
