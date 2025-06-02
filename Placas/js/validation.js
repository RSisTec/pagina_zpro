/**
 * Arquivo de validação de formulários
 * Responsável por validar os campos dos formulários antes do envio
 */

// Validação de CPF
function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, '');
    
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        return false;
    }
    
    let soma = 0;
    let resto;
    
    for (let i = 1; i <= 9; i++) {
        soma = soma + parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    
    resto = (soma * 10) % 11;
    
    if ((resto === 10) || (resto === 11)) {
        resto = 0;
    }
    
    if (resto !== parseInt(cpf.substring(9, 10))) {
        return false;
    }
    
    soma = 0;
    
    for (let i = 1; i <= 10; i++) {
        soma = soma + parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    
    resto = (soma * 10) % 11;
    
    if ((resto === 10) || (resto === 11)) {
        resto = 0;
    }
    
    if (resto !== parseInt(cpf.substring(10, 11))) {
        return false;
    }
    
    return true;
}

// Validação de CNPJ
function validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/[^\d]+/g, '');
    
    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
        return false;
    }
    
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) {
            pos = 9;
        }
    }
    
    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    
    if (resultado !== parseInt(digitos.charAt(0))) {
        return false;
    }
    
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) {
            pos = 9;
        }
    }
    
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    
    if (resultado !== parseInt(digitos.charAt(1))) {
        return false;
    }
    
    return true;
}

// Validação de documento (CPF ou CNPJ)
function validarDocumento(documento) {
    documento = documento.replace(/[^\d]+/g, '');
    
    if (documento.length === 11) {
        return validarCPF(documento);
    } else if (documento.length === 14) {
        return validarCNPJ(documento);
    }
    
    return false;
}

// Validação de e-mail
function validarEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

// Validação de telefone
function validarTelefone(telefone) {
    telefone = telefone.replace(/[^\d]+/g, '');
    return telefone.length >= 10 && telefone.length <= 11;
}

// Formatação de CPF/CNPJ
function formatarDocumento(documento) {
    documento = documento.replace(/[^\d]+/g, '');
    
    if (documento.length === 11) {
        return documento.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (documento.length === 14) {
        return documento.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    
    return documento;
}

// Formatação de telefone
function formatarTelefone(telefone) {
    telefone = telefone.replace(/[^\d]+/g, '');
    
    if (telefone.length === 11) {
        return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (telefone.length === 10) {
        return telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    
    return telefone;
}

// Validação do formulário de cadastro
function validarFormularioCadastro() {
    const nome = document.getElementById('nome').value.trim();
    const documento = document.getElementById('documento').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const termos = document.getElementById('termos').checked;
    
    let erros = [];
    
    if (nome.length < 3) {
        erros.push('Nome deve ter pelo menos 3 caracteres');
    }
    
    if (!validarDocumento(documento)) {
        erros.push('CPF/CNPJ inválido');
    }
    
    if (!validarEmail(email)) {
        erros.push('E-mail inválido');
    }
    
    if (!validarTelefone(telefone)) {
        erros.push('Telefone inválido');
    }
    
    if (!termos) {
        erros.push('Você deve aceitar os termos de uso');
    }
    
    return {
        valido: erros.length === 0,
        erros: erros
    };
}

// Validação do código de confirmação
function validarCodigoConfirmacao() {
    const inputs = document.querySelectorAll('.code-digit');
    let codigo = '';
    let valido = true;
    
    inputs.forEach(input => {
        if (!input.value) {
            valido = false;
        }
        codigo += input.value;
    });
    
    return {
        valido: valido,
        codigo: codigo
    };
}

// Aplicar máscaras aos campos
document.addEventListener('DOMContentLoaded', function() {
    // Máscara para CPF/CNPJ
    const documentoInput = document.getElementById('documento');
    if (documentoInput) {
        documentoInput.addEventListener('input', function() {
            this.value = formatarDocumento(this.value);
        });
    }
    
    // Máscara para telefone
    const telefoneInput = document.getElementById('telefone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', function() {
            this.value = formatarTelefone(this.value);
        });
    }
    
    // Navegação entre campos de código
    const codeInputs = document.querySelectorAll('.code-digit');
    codeInputs.forEach((input, index) => {
        input.addEventListener('input', function() {
            if (this.value && index < codeInputs.length - 1) {
                codeInputs[index + 1].focus();
            }
        });
        
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && !this.value && index > 0) {
                codeInputs[index - 1].focus();
            }
        });
    });
});
