// ============================================
// Vive la France - script.js
// Funcionalidades: Clima ao vivo, Conversor Euro/Real (dois sentidos),
// Modo claro/escuro e Carrossel de imagens do início
// APIs gratuitas, sem necessidade de chave (API key)
// ============================================

const cidades = {
    paris: { nome: "Paris", lat: 48.8566, lon: 2.3522 },
    nice: { nome: "Nice", lat: 43.7102, lon: 7.2620 },
    lyon: { nome: "Lyon", lat: 45.7640, lon: 4.8357 },
    estrasburgo: { nome: "Estrasburgo", lat: 48.5734, lon: 7.7521 }
};

// Mapeamento dos códigos meteorológicos (padrão WMO) usados pela Open-Meteo
const climaCodigos = {
    0: { desc: "Céu limpo", icone: "☀️" },
    1: { desc: "Poucas nuvens", icone: "🌤️" },
    2: { desc: "Parcialmente nublado", icone: "⛅" },
    3: { desc: "Nublado", icone: "☁️" },
    45: { desc: "Nevoeiro", icone: "🌫️" },
    48: { desc: "Nevoeiro com gelo", icone: "🌫️" },
    51: { desc: "Garoa fraca", icone: "🌦️" },
    53: { desc: "Garoa moderada", icone: "🌦️" },
    55: { desc: "Garoa forte", icone: "🌧️" },
    61: { desc: "Chuva fraca", icone: "🌧️" },
    63: { desc: "Chuva moderada", icone: "🌧️" },
    65: { desc: "Chuva forte", icone: "🌧️" },
    71: { desc: "Neve fraca", icone: "🌨️" },
    73: { desc: "Neve moderada", icone: "❄️" },
    75: { desc: "Neve forte", icone: "❄️" },
    80: { desc: "Pancadas de chuva", icone: "🌦️" },
    81: { desc: "Pancadas moderadas", icone: "🌧️" },
    82: { desc: "Pancadas fortes", icone: "⛈️" },
    95: { desc: "Tempestade", icone: "⛈️" },
    96: { desc: "Tempestade com granizo", icone: "⛈️" },
    99: { desc: "Tempestade forte", icone: "⛈️" }
};

// Configuração dos dois sentidos de conversão (Frankfurter API v2 - /rate/{base}/{quote})
const direcoesConversor = {
    EUR_BRL: {
        base: "EUR",
        quote: "BRL",
        simboloOrigem: "€",
        simboloDestino: "R$",
        placeholder: "Valor em €"
    },
    BRL_EUR: {
        base: "BRL",
        quote: "EUR",
        simboloOrigem: "R$",
        simboloDestino: "€",
        placeholder: "Valor em R$"
    }
};

// Busca o clima atual de uma cidade francesa usando a API Open-Meteo
async function buscarClima(cidadeKey) {
    const resultadoEl = document.getElementById("clima-resultado");
    const cidade = cidades[cidadeKey];

    resultadoEl.innerHTML = `<p class="loading-text">Buscando clima em ${cidade.nome}...</p>`;

    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${cidade.lat}&longitude=${cidade.lon}&current_weather=true`;
        const response = await fetch(url);

        if (!response.ok) throw new Error("Falha na requisição do clima");

        const data = await response.json();
        const atual = data.current_weather;
        const info = climaCodigos[atual.weathercode] || { desc: "Condição desconhecida", icone: "🌡️" };

        resultadoEl.innerHTML = `
            <div class="clima-info">
                <span class="clima-icone">${info.icone}</span>
                <div>
                    <p class="clima-temp">${Math.round(atual.temperature)}°C</p>
                    <p class="clima-desc">${info.desc} em ${cidade.nome}</p>
                    <p class="clima-vento">Vento: ${Math.round(atual.windspeed)} km/h</p>
                </div>
            </div>
        `;
    } catch (erro) {
        resultadoEl.innerHTML = `<p class="erro-text">Não foi possível carregar o clima agora. Tente novamente.</p>`;
        console.error("Erro ao buscar clima:", erro);
    }
}

// Converte um valor de Euro para Real ou de Real para Euro, dependendo do
// sentido selecionado, usando a API Frankfurter
async function converterMoeda() {
    const valorInput = document.getElementById("valor-euro");
    const resultadoEl = document.getElementById("conversor-resultado");
    const direcaoSelect = document.getElementById("conversor-direcao");
    const direcaoKey = direcaoSelect ? direcaoSelect.value : "EUR_BRL";
    const direcao = direcoesConversor[direcaoKey];

    const valor = parseFloat(valorInput.value);

    if (!valor || valor <= 0) {
        resultadoEl.innerHTML = `<p class="erro-text">Digite um valor válido.</p>`;
        return;
    }

    resultadoEl.innerHTML = `<p class="loading-text">Convertendo...</p>`;

    try {
        // A v2 da Frankfurter não aceita mais "amount" nem "/latest": retorna a
        // cotação pura em /rate/{base}/{quote}, e a conversão é calculada aqui.
        const url = `https://api.frankfurter.dev/v2/rate/${direcao.base}/${direcao.quote}`;
        const response = await fetch(url);

        if (!response.ok) throw new Error("Falha na requisição da conversão");

        const data = await response.json();
        const valorConvertido = valor * data.rate;

        resultadoEl.innerHTML = `
            <p class="conversor-valor">${direcao.simboloOrigem}${valor.toFixed(2)} = <strong>${direcao.simboloDestino} ${valorConvertido.toFixed(2)}</strong></p>
            <p class="conversor-data">Cotação de ${data.date}</p>
        `;
    } catch (erro) {
        resultadoEl.innerHTML = `<p class="erro-text">Não foi possível converter agora. Tente novamente.</p>`;
        console.error("Erro ao converter moeda:", erro);
    }
}

// Atualiza o placeholder do campo de valor de acordo com o sentido escolhido
function atualizarPlaceholderConversor() {
    const direcaoSelect = document.getElementById("conversor-direcao");
    const valorInput = document.getElementById("valor-euro");
    if (!direcaoSelect || !valorInput) return;

    const direcao = direcoesConversor[direcaoSelect.value];
    valorInput.placeholder = direcao.placeholder;
}

// ============================================
// Modo claro/escuro
// ============================================
function initThemeToggle() {
    const root = document.documentElement;
    const btn = document.getElementById("theme-toggle");
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function getTemaPreferido() {
        const salvo = localStorage.getItem("vlf-theme");
        if (salvo) return salvo;
        return mediaQuery.matches ? "dark" : "light";
    }

    function aplicarTema(tema) {
        root.setAttribute("data-theme", tema);
        if (btn) {
            btn.setAttribute(
                "aria-label",
                tema === "dark" ? "Ativar modo claro" : "Ativar modo escuro"
            );
        }
    }

    // O tema já foi aplicado de forma inline no <head> para evitar flash;
    // aqui apenas garantimos que está sincronizado e ligamos os eventos.
    aplicarTema(getTemaPreferido());

    if (btn) {
        btn.addEventListener("click", () => {
            const atual = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
            const proximo = atual === "dark" ? "light" : "dark";
            localStorage.setItem("vlf-theme", proximo);
            aplicarTema(proximo);
        });
    }

    // Se o usuário nunca escolheu manualmente, acompanha mudanças do sistema
    mediaQuery.addEventListener("change", (e) => {
        if (!localStorage.getItem("vlf-theme")) {
            aplicarTema(e.matches ? "dark" : "light");
        }
    });
}

// ============================================
// Carrossel de imagens de fundo do início
// ============================================
function initHeroCarousel() {
    const slides = document.querySelectorAll(".hero-bg-slide");
    if (slides.length < 2) return;

    let indiceAtual = 0;

    setInterval(() => {
        slides[indiceAtual].classList.remove("active");
        indiceAtual = (indiceAtual + 1) % slides.length;
        slides[indiceAtual].classList.add("active");
    }, 6000);
}

// Inicializa os eventos assim que a página carrega
document.addEventListener("DOMContentLoaded", () => {
    const seletorCidade = document.getElementById("cidade-select");
    const botaoConverter = document.getElementById("converter-btn");
    const inputValor = document.getElementById("valor-euro");
    const direcaoSelect = document.getElementById("conversor-direcao");

    if (seletorCidade) {
        buscarClima(seletorCidade.value);
        seletorCidade.addEventListener("change", (e) => buscarClima(e.target.value));
    }

    if (botaoConverter) {
        botaoConverter.addEventListener("click", converterMoeda);
    }

    if (inputValor) {
        inputValor.addEventListener("keydown", (e) => {
            if (e.key === "Enter") converterMoeda();
        });
    }

    if (direcaoSelect) {
        atualizarPlaceholderConversor();
        direcaoSelect.addEventListener("change", () => {
            atualizarPlaceholderConversor();
            document.getElementById("conversor-resultado").innerHTML = "";
        });
    }

    initThemeToggle();
    initHeroCarousel();
});