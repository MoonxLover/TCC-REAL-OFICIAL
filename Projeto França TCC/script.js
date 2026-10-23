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

// ============================================
// Login e cadastro (simulado no navegador)
// ATENÇÃO: os dados ficam no localStorage deste navegador. Serve para
// demonstração/TCC, mas NÃO é seguro para dados reais. Para um login de
// verdade, use um serviço como Firebase Auth ou Supabase Auth.
// ============================================
const AUTH_USERS_KEY = "vlf-users";
const AUTH_SESSION_KEY = "vlf-session";

function lerJSON(chave, padrao) {
    try {
        const bruto = localStorage.getItem(chave);
        return bruto ? JSON.parse(bruto) : padrao;
    } catch (e) {
        return padrao;
    }
}

// Grava no localStorage sem quebrar caso o navegador bloqueie o armazenamento
function gravar(chave, valor) {
    try {
        localStorage.setItem(chave, valor);
        return true;
    } catch (e) {
        return false;
    }
}

const MSG_SEM_STORAGE = "Seu navegador está bloqueando o armazenamento local (modo anônimo ou cookies desativados), então não dá para salvar a conta.";

// Executa uma ação e devolve uma mensagem amigável se algo inesperado acontecer
async function tentar(acao) {
    try {
        return await acao();
    } catch (e) {
        console.error(e);
        return { ok: false, msg: "Algo deu errado ao processar. Tente novamente." };
    }
}

function getUsuarios() {
    return lerJSON(AUTH_USERS_KEY, []);
}

function getSessao() {
    return lerJSON(AUTH_SESSION_KEY, null);
}

// Gera um hash da senha (SHA-256) para não guardá-la em texto puro
async function hashSenha(senha) {
    if (window.crypto && window.crypto.subtle) {
        const dados = new TextEncoder().encode(senha);
        const buffer = await crypto.subtle.digest("SHA-256", dados);
        return Array.from(new Uint8Array(buffer))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
    }
    // Alternativa simples caso o navegador não ofereça crypto.subtle
    let h = 5381;
    for (let i = 0; i < senha.length; i++) {
        h = ((h << 5) + h + senha.charCodeAt(i)) >>> 0;
    }
    return "d" + h.toString(16);
}

async function cadastrarUsuario(nome, email, senha) {
    const emailNorm = email.trim().toLowerCase();
    const usuarios = getUsuarios();

    if (usuarios.some((u) => u.email === emailNorm)) {
        return { ok: false, msg: "Já existe uma conta com esse e-mail." };
    }

    const hash = await hashSenha(senha);
    usuarios.push({ nome: nome.trim(), email: emailNorm, hash });
    const salvouUsuarios = gravar(AUTH_USERS_KEY, JSON.stringify(usuarios));
    const salvouSessao = gravar(AUTH_SESSION_KEY, JSON.stringify({ nome: nome.trim(), email: emailNorm }));
    if (!salvouUsuarios || !salvouSessao) {
        return { ok: false, msg: MSG_SEM_STORAGE };
    }
    return { ok: true };
}

async function entrarUsuario(email, senha) {
    const emailNorm = email.trim().toLowerCase();
    const hash = await hashSenha(senha);
    const usuario = getUsuarios().find((u) => u.email === emailNorm);

    if (!usuario) {
        return {
            ok: false,
            msg: "Não encontramos uma conta com esse e-mail neste navegador. Use a aba “Criar conta” primeiro."
        };
    }
    if (usuario.hash !== hash) {
        return { ok: false, msg: "Senha incorreta." };
    }

    if (!gravar(AUTH_SESSION_KEY, JSON.stringify({ nome: usuario.nome, email: usuario.email }))) {
        return { ok: false, msg: MSG_SEM_STORAGE };
    }
    return { ok: true };
}

function sairDaConta() {
    localStorage.removeItem(AUTH_SESSION_KEY);
}

// Troca "Entrar" por "Sair (Nome)" no menu quando houver sessão ativa
function atualizarNavAuth() {
    const item = document.getElementById("nav-auth");
    if (!item) return;

    const sessao = getSessao();
    const estavaAtivo = item.querySelector("a.ativo") !== null;
    item.textContent = "";

    const link = document.createElement("a");
    if (sessao) {
        link.href = "#";
        link.textContent = "Sair (" + sessao.nome.split(" ")[0] + ")";
        link.addEventListener("click", (e) => {
            e.preventDefault();
            sairDaConta();
            window.location.reload();
        });
    } else {
        link.href = "login.html";
        link.textContent = "Entrar";
        if (estavaAtivo) link.className = "ativo";
    }
    item.appendChild(link);
}

function mostrarMensagem(el, texto, sucesso) {
    if (!el) return;
    el.textContent = texto;
    el.classList.toggle("ok", !!sucesso);
}

function initLogin() {
    const formLogin = document.getElementById("login-form");
    const formCadastro = document.getElementById("cadastro-form");
    if (!formLogin || !formCadastro) return;

    const abaEntrar = document.getElementById("tab-entrar");
    const abaCadastro = document.getElementById("tab-cadastro");
    const blocoForms = document.getElementById("login-forms");
    const blocoLogado = document.getElementById("login-logged");
    const msgLogin = document.getElementById("login-msg");
    const msgCadastro = document.getElementById("cadastro-msg");

    function mostrarAba(aba) {
        const entrar = aba === "entrar";
        formLogin.hidden = !entrar;
        formCadastro.hidden = entrar;
        abaEntrar.classList.toggle("active", entrar);
        abaCadastro.classList.toggle("active", !entrar);
        abaEntrar.setAttribute("aria-selected", String(entrar));
        abaCadastro.setAttribute("aria-selected", String(!entrar));
        mostrarMensagem(msgLogin, "");
        mostrarMensagem(msgCadastro, "");
    }

    abaEntrar.addEventListener("click", () => mostrarAba("entrar"));
    abaCadastro.addEventListener("click", () => mostrarAba("cadastro"));

    // Botões de mostrar/ocultar senha
    document.querySelectorAll(".senha-toggle").forEach((btn) => {
        btn.addEventListener("click", () => {
            const campo = document.getElementById(btn.dataset.alvo);
            if (!campo) return;
            const mostrando = campo.type === "text";
            campo.type = mostrando ? "password" : "text";
            btn.setAttribute("aria-label", mostrando ? "Mostrar senha" : "Ocultar senha");
        });
    });

    // Se já estiver logado, mostra o painel de boas-vindas
    const sessao = getSessao();
    if (sessao) {
        blocoForms.hidden = true;
        blocoLogado.hidden = false;
        document.getElementById("login-logged-nome").textContent = sessao.nome;
        document.getElementById("login-sair").addEventListener("click", () => {
            sairDaConta();
            window.location.reload();
        });
    }

    formLogin.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value;
        const senha = document.getElementById("login-senha").value;

        if (!email.includes("@") || !senha) {
            mostrarMensagem(msgLogin, "Preencha o e-mail e a senha.");
            return;
        }

        const resultado = await tentar(() => entrarUsuario(email, senha));
        if (!resultado.ok) {
            mostrarMensagem(msgLogin, resultado.msg);
            return;
        }
        mostrarMensagem(msgLogin, "Login realizado! Redirecionando...", true);
        atualizarNavAuth();
        setTimeout(() => { window.location.href = "index.html"; }, 800);
    });

    formCadastro.addEventListener("submit", async (e) => {
        e.preventDefault();
        const nome = document.getElementById("cad-nome").value;
        const email = document.getElementById("cad-email").value;
        const senha = document.getElementById("cad-senha").value;
        const senha2 = document.getElementById("cad-senha2").value;

        if (nome.trim().length < 2) {
            mostrarMensagem(msgCadastro, "Digite seu nome.");
            return;
        }
        if (!email.includes("@") || !email.includes(".")) {
            mostrarMensagem(msgCadastro, "Digite um e-mail válido.");
            return;
        }
        if (senha.length < 6) {
            mostrarMensagem(msgCadastro, "A senha precisa ter pelo menos 6 caracteres.");
            return;
        }
        if (senha !== senha2) {
            mostrarMensagem(msgCadastro, "As senhas não são iguais.");
            return;
        }

        const resultado = await tentar(() => cadastrarUsuario(nome, email, senha));
        if (!resultado.ok) {
            mostrarMensagem(msgCadastro, resultado.msg);
            return;
        }
        mostrarMensagem(msgCadastro, "Conta criada! Redirecionando...", true);
        atualizarNavAuth();
        setTimeout(() => { window.location.href = "index.html"; }, 800);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    atualizarNavAuth();
    initLogin();
});