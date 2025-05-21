// Cores para os setores da roleta - paleta moderna e vibrante
const CORES = [
    '#FF3D71', // Rosa vibrante
    '#FF9E3D', // Laranja
    '#FFDA3D', // Amarelo
    '#3DFF8A', // Verde neon
    '#3DB5FF', // Azul claro
    '#8A3DFF', // Roxo
    '#FF3D9E', // Rosa pink
    '#3DFFDA', // Turquesa
    '#B5733D', // Marrom
    '#5271FF'  // Azul índigo
];

// Elementos do DOM
const roletaElement = document.getElementById('roleta');
const botaoGirar = document.getElementById('botao-girar');
const resultadoElement = document.getElementById('resultado');

// Variáveis de controle
let girando = false;
let ultimaPosicao = null;
let anguloAcumulado = 0; // Ângulo total acumulado para evitar rotação reversa
let numerosElements = []; // Array para armazenar os elementos de texto dos números

// Função para criar os setores da roleta
function criarSetoresRoleta() {
    const anguloSetor = 360 / 10; // 10 divisões
    
    for (let i = 0; i < 10; i++) {
        const anguloInicio = i * anguloSetor;
        const anguloFim = (i + 1) * anguloSetor;
        
        // Calcular pontos do setor
        const x1 = 150 + 140 * Math.cos((anguloInicio - 90) * Math.PI / 180);
        const y1 = 150 + 140 * Math.sin((anguloInicio - 90) * Math.PI / 180);
        const x2 = 150 + 140 * Math.cos((anguloFim - 90) * Math.PI / 180);
        const y2 = 150 + 140 * Math.sin((anguloFim - 90) * Math.PI / 180);
        
        // Criar caminho SVG para o setor
        const caminhoGrande = `M 150,150 L ${x1},${y1} A 140,140 0 0,1 ${x2},${y2} Z`;
        
        // Criar elemento path para o setor
        const setor = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        setor.setAttribute('d', caminhoGrande);
        setor.setAttribute('fill', CORES[i]);
        setor.setAttribute('stroke', '#ffffff');
        setor.setAttribute('stroke-width', '1');
        setor.setAttribute('filter', 'url(#shadow)');
        setor.setAttribute('data-setor', i + 1); // Adicionar atributo para identificar o setor
        roletaElement.appendChild(setor);
        
        // Adicionar números aos setores
        const anguloTexto = anguloInicio + anguloSetor / 2;
        const xTexto = 150 + 100 * Math.cos((anguloTexto - 90) * Math.PI / 180);
        const yTexto = 150 + 100 * Math.sin((anguloTexto - 90) * Math.PI / 180);
        
        // Criar grupo para o texto para permitir rotação independente
        const grupoTexto = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        grupoTexto.setAttribute('transform', `translate(${xTexto}, ${yTexto})`);
        
        const texto = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        texto.setAttribute('x', '0');
        texto.setAttribute('y', '0');
        texto.setAttribute('fill', '#ffffff');
        texto.setAttribute('font-weight', 'bold');
        texto.setAttribute('font-size', '18');
        texto.setAttribute('text-anchor', 'middle');
        texto.setAttribute('dominant-baseline', 'middle');
        texto.setAttribute('filter', 'url(#textShadow)');
        texto.textContent = i + 1;
        
        grupoTexto.appendChild(texto);
        roletaElement.appendChild(grupoTexto);
        
        // Armazenar referência ao grupo de texto para rotação posterior
        numerosElements.push(grupoTexto);
    }
    
    // Adicionar filtros SVG para sombras
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    
    // Filtro para sombra dos setores
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', 'shadow');
    filter.setAttribute('x', '-20%');
    filter.setAttribute('y', '-20%');
    filter.setAttribute('width', '140%');
    filter.setAttribute('height', '140%');
    
    const feDropShadow = document.createElementNS('http://www.w3.org/2000/svg', 'feDropShadow');
    feDropShadow.setAttribute('dx', '0');
    feDropShadow.setAttribute('dy', '0');
    feDropShadow.setAttribute('stdDeviation', '3');
    feDropShadow.setAttribute('flood-color', 'rgba(0,0,0,0.3)');
    
    filter.appendChild(feDropShadow);
    defs.appendChild(filter);
    
    // Filtro para sombra do texto
    const textFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    textFilter.setAttribute('id', 'textShadow');
    
    const feDropShadowText = document.createElementNS('http://www.w3.org/2000/svg', 'feDropShadow');
    feDropShadowText.setAttribute('dx', '0');
    feDropShadowText.setAttribute('dy', '1');
    feDropShadowText.setAttribute('stdDeviation', '1');
    feDropShadowText.setAttribute('flood-color', 'rgba(0,0,0,0.7)');
    
    textFilter.appendChild(feDropShadowText);
    defs.appendChild(textFilter);
    
    roletaElement.appendChild(defs);
    
    // Adicionar círculo central
    const circulo = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circulo.setAttribute('cx', '150');
    circulo.setAttribute('cy', '150');
    circulo.setAttribute('r', '25');
    circulo.setAttribute('fill', '#ffffff');
    circulo.setAttribute('filter', 'url(#shadow)');
    roletaElement.appendChild(circulo);
    
    // Adicionar círculo interno decorativo
    const circuloInterno = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circuloInterno.setAttribute('cx', '150');
    circuloInterno.setAttribute('cy', '150');
    circuloInterno.setAttribute('r', '15');
    circuloInterno.setAttribute('fill', '#333333');
    roletaElement.appendChild(circuloInterno);
}

// Função para atualizar a rotação dos números para que fiquem sempre de pé
function atualizarRotacaoNumeros(anguloRoleta) {
    const anguloSetor = 360 / 10;
    
    for (let i = 0; i < 10; i++) {
        // Calcular o ângulo atual do setor
        const anguloTexto = i * anguloSetor + anguloSetor / 2;
        
        // Aplicar rotação contrária à da roleta para manter o texto de pé
        numerosElements[i].setAttribute('transform', 
            `translate(${150 + 100 * Math.cos((anguloTexto - 90) * Math.PI / 180)}, 
                      ${150 + 100 * Math.sin((anguloTexto - 90) * Math.PI / 180)}) 
             rotate(${-anguloRoleta})`);
    }
}

// Função para determinar visualmente qual setor está sob a seta
function determinarSetorVisual() {
    // Obter o ângulo atual da roleta
    const transformValue = roletaElement.style.transform;
    const match = transformValue.match(/rotate\(([^)]+)deg\)/);
    if (!match) return null;
    
    const anguloAtual = parseFloat(match[1]);
    
    // Normalizar o ângulo para 0-360
    let anguloNormalizado = anguloAtual % 360;
    if (anguloNormalizado < 0) {
        anguloNormalizado += 360;
    }
    
    // Cada setor ocupa 36 graus (360/10)
    // A roleta começa com o setor 1 no topo (0 graus)
    // Quando a roleta gira, o ângulo aumenta no sentido horário
    
    // Calcular qual setor está no topo (sob a seta)
    // Como a roleta gira no sentido horário, precisamos fazer 360 - ângulo
    // para determinar qual setor está no topo
    const anguloRelativoAoTopo = (360 - anguloNormalizado) % 360;
    
    // Converter para índice do setor (0-9)
    const indiceSetor = Math.floor(anguloRelativoAoTopo / 36);
    
    // Retornar o número do setor (1-10)
    return indiceSetor + 1;
}

// Função para girar a roleta
function girarRoleta() {
    if (girando) return; // Evitar múltiplos cliques durante a animação
    
    girando = true;
    botaoGirar.disabled = true;
    resultadoElement.textContent = '';
    resultadoElement.classList.remove('show');
    
    // Gerar uma posição aleatória que não seja igual à última
    let novaPosicao;
    do {
        novaPosicao = Math.floor(Math.random() * 10);
    } while (novaPosicao === ultimaPosicao && ultimaPosicao !== null);
    
    // Calcular ângulo aleatório adicional para variar o ponto de parada
    const anguloAleatorio = Math.random() * 36; // Variação dentro do setor
    
    // Calcular ângulo adicional para este giro (sempre positivo)
    // Garantimos pelo menos 3 voltas completas (1080 graus)
    const anguloAdicional = 1080 + ((novaPosicao * 36) + anguloAleatorio);
    
    // Ângulo inicial desta animação é o ângulo acumulado até agora
    const anguloInicial = anguloAcumulado;
    
    // Ângulo final desta animação (sempre maior que o inicial)
    const anguloFinal = anguloInicial + anguloAdicional;
    
    // Iniciar animação
    let inicio = null;
    const duracao = 2000; // 2 segundos
    
    function animar(timestamp) {
        if (!inicio) inicio = timestamp;
        const progresso = Math.min((timestamp - inicio) / duracao, 1);
        
        // Função de easing para desaceleração suave
        const easing = (t) => 1 - Math.pow(1 - t, 3);
        
        // Calcular ângulo atual - interpolando do inicial até o final
        // Isso garante que o ângulo sempre aumenta, nunca diminui
        const anguloAtual = anguloInicial + (anguloAdicional * easing(progresso));
        
        // Atualizar a roleta - sempre com valor crescente
        roletaElement.style.transform = `rotate(${anguloAtual}deg)`;
        
        // Atualizar a rotação dos números para que fiquem sempre de pé
        atualizarRotacaoNumeros(anguloAtual);
        
        if (progresso < 1) {
            requestAnimationFrame(animar);
        } else {
            // Animação concluída - atualizar o ângulo acumulado
            anguloAcumulado = anguloFinal;
            girando = false;
            botaoGirar.disabled = false;
            ultimaPosicao = novaPosicao;
            
            // Determinar visualmente qual setor está sob a seta
            const setorVisual = determinarSetorVisual();
            
            // Mostrar resultado com animação
            resultadoElement.textContent = `Resultado: ${setorVisual}`;
            setTimeout(() => {
                resultadoElement.classList.add('show');
            }, 100);
            
            // Efeito de pulso na roleta
            roletaElement.style.transition = 'transform 0.2s ease-in-out';
            setTimeout(() => {
                roletaElement.style.transform = `rotate(${anguloAcumulado + 5}deg)`;
                atualizarRotacaoNumeros(anguloAcumulado + 5);
                setTimeout(() => {
                    roletaElement.style.transform = `rotate(${anguloAcumulado - 5}deg)`;
                    atualizarRotacaoNumeros(anguloAcumulado - 5);
                    setTimeout(() => {
                        roletaElement.style.transform = `rotate(${anguloAcumulado}deg)`;
                        atualizarRotacaoNumeros(anguloAcumulado);
                        roletaElement.style.transition = 'transform 0.3s cubic-bezier(0.215, 0.610, 0.355, 1.000)';
                    }, 100);
                }, 100);
            }, 100);
        }
    }
    
    requestAnimationFrame(animar);
}

// Inicializar a roleta
document.addEventListener('DOMContentLoaded', () => {
    criarSetoresRoleta();
    botaoGirar.addEventListener('click', girarRoleta);
    
    // Inicializar os números na posição correta
    atualizarRotacaoNumeros(0);
});
