// Script para o site Daya Estética

document.addEventListener('DOMContentLoaded', function() {
    // Referência ao formulário
    const form = document.getElementById('agendamento-form');
    
    // Máscara para o campo de telefone
    const telefoneInput = document.getElementById('telefone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) {
                value = value.substring(0, 11);
            }
            
            // Formata o número conforme digita
            if (value.length > 0) {
                if (value.length <= 2) {
                    value = `(${value}`;
                } else if (value.length <= 6) {
                    value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
                } else if (value.length <= 10) {
                    value = `(${value.substring(0, 2)}) ${value.substring(2, 6)}-${value.substring(6)}`;
                } else {
                    value = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7)}`;
                }
            }
            
            e.target.value = value;
        });
    }
    
    // Validação do formulário
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validação básica
            const nome = document.getElementById('nome').value.trim();
            const email = document.getElementById('email').value.trim();
            const telefone = document.getElementById('telefone').value.trim();
            const servico = document.getElementById('servico').value;
            const data = document.getElementById('data').value;
            const horario = document.getElementById('horario').value;
            
            // Verifica campos obrigatórios
            if (!nome || !email || !telefone || !servico || !data || !horario) {
                mostrarMensagem('Por favor, preencha todos os campos obrigatórios.', 'erro');
                return;
            }
            
            // Validação de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                mostrarMensagem('Por favor, insira um endereço de e-mail válido.', 'erro');
                return;
            }
            
            // Validação de telefone (pelo menos 10 dígitos)
            const telefoneDigitos = telefone.replace(/\D/g, '');
            if (telefoneDigitos.length < 10) {
                mostrarMensagem('Por favor, insira um número de telefone válido.', 'erro');
                return;
            }
            
            // Validação de data (não pode ser no passado)
            const dataAtual = new Date();
            dataAtual.setHours(0, 0, 0, 0);
            const dataSelecionada = new Date(data);
            
            if (dataSelecionada < dataAtual) {
                mostrarMensagem('A data selecionada não pode ser no passado.', 'erro');
                return;
            }
            
            // Se passou por todas as validações, prepara os dados para envio
            const mensagem = document.getElementById('mensagem').value.trim();
            const formData = {
                nome,
                email,
                telefone,
                servico: document.getElementById('servico').options[document.getElementById('servico').selectedIndex].text,
                data: formatarData(data),
                horario: document.getElementById('horario').options[document.getElementById('horario').selectedIndex].text,
                mensagem
            };
            
            // Simulação de envio (em produção, substituir por envio real)
            console.log('Dados do formulário:', formData);
            
            // Prepara texto para WhatsApp
            const textoWhatsApp = encodeURIComponent(
                `Olá! Gostaria de agendar um atendimento na Daya Estética.\n\n` +
                `Nome: ${formData.nome}\n` +
                `Email: ${formData.email}\n` +
                `Telefone: ${formData.telefone}\n` +
                `Serviço: ${formData.servico}\n` +
                `Data: ${formData.data}\n` +
                `Horário: ${formData.horario}\n` +
                `Mensagem: ${formData.mensagem || 'Nenhuma mensagem adicional.'}`
            );
            
            // Mostra mensagem de sucesso
            mostrarMensagem('Solicitação recebida com sucesso! Redirecionando para WhatsApp...', 'sucesso');
            
            // Redireciona para WhatsApp após 2 segundos
            setTimeout(() => {
                window.open(`https://wa.me/5511999999999?text=${textoWhatsApp}`, '_blank');
                form.reset();
            }, 2000);
        });
    }
    
    // Função para mostrar mensagens de feedback
    function mostrarMensagem(texto, tipo) {
        // Remove mensagens anteriores
        const mensagemAnterior = document.querySelector('.mensagem-feedback');
        if (mensagemAnterior) {
            mensagemAnterior.remove();
        }
        
        // Cria elemento de mensagem
        const mensagem = document.createElement('div');
        mensagem.className = `mensagem-feedback ${tipo}`;
        mensagem.textContent = texto;
        
        // Estiliza a mensagem
        mensagem.style.padding = '10px 15px';
        mensagem.style.marginTop = '15px';
        mensagem.style.borderRadius = '5px';
        mensagem.style.textAlign = 'center';
        
        if (tipo === 'erro') {
            mensagem.style.backgroundColor = '#ffebee';
            mensagem.style.color = '#c62828';
            mensagem.style.border = '1px solid #ef9a9a';
        } else {
            mensagem.style.backgroundColor = '#e8f5e9';
            mensagem.style.color = '#2e7d32';
            mensagem.style.border = '1px solid #a5d6a7';
        }
        
        // Insere a mensagem após o botão de envio
        const botao = document.querySelector('.btn');
        botao.parentNode.insertBefore(mensagem, botao.nextSibling);
        
        // Remove a mensagem após 5 segundos
        if (tipo === 'sucesso') {
            setTimeout(() => {
                mensagem.remove();
            }, 5000);
        }
    }
    
    // Função para formatar a data
    function formatarData(dataString) {
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
    
    // Animação de rolagem suave para os links de navegação
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Ajuste para o cabeçalho fixo
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Animação para os cards de serviços
    const observerOptions = {
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.servico-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });
    
    // Data mínima para o campo de data (hoje)
    const inputData = document.getElementById('data');
    if (inputData) {
        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        const dia = String(hoje.getDate()).padStart(2, '0');
        inputData.min = `${ano}-${mes}-${dia}`;
    }
});
