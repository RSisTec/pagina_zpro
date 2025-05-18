// Script para interatividade do site
document.addEventListener('DOMContentLoaded', function() {
    // Animação suave para links de navegação
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Atualiza classe ativa no menu
                document.querySelectorAll('nav ul li a').forEach(link => {
                    link.classList.remove('active');
                });
                this.classList.add('active');
            }
        });
    });
    
    // Animação para os cards de serviços
    const cards = document.querySelectorAll('.card');
    
    function checkScroll() {
        cards.forEach((card, index) => {
            const cardTop = card.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (cardTop < windowHeight - 100) {
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 200);
            }
        });
    }
    
    // Inicialmente esconde os cards
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
    
    // Verifica ao carregar a página
    checkScroll();
    
    // Verifica ao rolar a página
    window.addEventListener('scroll', checkScroll);
    
    // Envio do formulário via API
    const form = document.querySelector('#formulario-contato');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Preparação para envio
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            const statusMensagem = document.getElementById('status-mensagem');
            
            // Desabilita o botão durante o envio
            submitButton.textContent = 'Enviando...';
            submitButton.disabled = true;
            
            // Coleta os dados do formulário
            const formData = {
                nome: document.getElementById('nome').value,
                email: document.getElementById('email').value,
                telefone: document.getElementById('telefone').value,
                servico: document.getElementById('servico').value,
                mensagem: document.getElementById('mensagem').value
            };
            
            // Endpoint da API local para testes
            const apiUrl = 'http://localhost:3000/contato';
            
            // Configuração da requisição
            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            .then(response => {
                // Verifica se a resposta foi bem-sucedida
                if (!response.ok) {
                    throw new Error('Erro ao enviar mensagem. Por favor, tente novamente.');
                }
                return response.json();
            })
            .then(data => {
                // Exibe mensagem de sucesso
                statusMensagem.innerHTML = '<div class="alert-success">Mensagem enviada com sucesso! Entraremos em contato em breve.</div>';
                form.reset();
            })
            .catch(error => {
                // Exibe mensagem de erro
                statusMensagem.innerHTML = `<div class="alert-error">${error.message}</div>`;
                console.error('Erro:', error);
            })
            .finally(() => {
                // Restaura o botão
                submitButton.textContent = originalText;
                submitButton.disabled = false;
                
                // Remove a mensagem de status após 5 segundos
                setTimeout(() => {
                    statusMensagem.innerHTML = '';
                }, 5000);
            });
        });
    }
    
    // Atualiza classe ativa no menu com base na posição de rolagem
    function updateActiveMenu() {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('nav ul li a');
        
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = '#' + section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentSection) {
                link.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', updateActiveMenu);
});
