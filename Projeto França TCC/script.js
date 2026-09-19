// ============================================
// Vive la France - script.js
// Funcionalidades: Clima ao vivo + Conversor Euro/Real
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

// Converte um valor de Euro para Real usando a API Frankfurter
async function converterMoeda() {
    const valorInput = document.getElementById("valor-euro");
    const resultadoEl = document.getElementById("conversor-resultado");
    const valor = parseFloat(valorInput.value);

    if (!valor || valor <= 0) {
        resultadoEl.innerHTML = `<p class="erro-text">Digite um valor válido em euros.</p>`;
        return;
    }

    resultadoEl.innerHTML = `<p class="loading-text">Convertendo...</p>`;

    try {
        const url = `https://api.frankfurter.app/latest?amount=${valor}&from=EUR&to=BRL`;
        const response = await fetch(url);

        if (!response.ok) throw new Error("Falha na requisição da conversão");

        const data = await response.json();
        const valorConvertido = data.rates.BRL;

        resultadoEl.innerHTML = `
            <p class="conversor-valor">€${valor.toFixed(2)} = <strong>R$ ${valorConvertido.toFixed(2)}</strong></p>
            <p class="conversor-data">Cotação de ${data.date}</p>
        `;
    } catch (erro) {
        resultadoEl.innerHTML = `<p class="erro-text">Não foi possível converter agora. Tente novamente.</p>`;
        console.error("Erro ao converter moeda:", erro);
    }
}

// Inicializa os eventos assim que a página carrega
document.addEventListener("DOMContentLoaded", () => {
    const seletorCidade = document.getElementById("cidade-select");
    const botaoConverter = document.getElementById("converter-btn");
    const inputValor = document.getElementById("valor-euro");

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
});