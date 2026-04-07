// Initialize Icons
lucide.createIcons();

// ==========================================
// STATE MANAGEMENT
// ==========================================
const state = {
    user: null,
    projects: [],
    currentProject: null,
    sessionTimer: null,
    sessionSeconds: 0,
    saveTimer: null
};

// ==========================================
// DOM ELEMENTS
// ==========================================
const DOM = {
    app: document.getElementById('app'),
    sidebar: document.getElementById('sidebar'),
    views: document.querySelectorAll('.view'),
    toast: document.getElementById('toast'),
    
    // Login
    formLogin: document.getElementById('form-login'),
    loginEmail: document.getElementById('login-email'),
    userDisplayName: document.getElementById('user-display-name'),
    btnLogout: document.getElementById('btn-logout'),
    
    // Dashboard
    projList: document.getElementById('projects-list'),
    statProj: document.getElementById('stat-projetos'),
    statSess: document.getElementById('stat-sessoes'),
    
    // New Project
    formNewProj: document.getElementById('form-new-project'),
    projMode: document.getElementById('proj-mode'),
    camposAcad: document.getElementById('campos-academico'),
    camposPoet: document.getElementById('campos-poetico'),
    btnCancelProj: document.getElementById('btn-cancel-project'),
    
    // Editor
    editorTitle: document.getElementById('editor-title'),
    editorMeta: document.getElementById('editor-meta-info'),
    mainTextarea: document.getElementById('main-textarea'),
    wordCount: document.getElementById('word-count'),
    sessionTime: document.getElementById('session-time'),
    saveStatus: document.getElementById('save-status'),
    btnBackDash: document.getElementById('btn-back-dash'),
    btnAnalyze: document.getElementById('btn-analyze'),
    h2Panel: document.getElementById('h2-panel'),
    h2Content: document.getElementById('h2-content'),
    btnCloseH2: document.getElementById('btn-close-h2')
};

// ==========================================
// UTILS
// ==========================================
function showToast(msg, type = "info") {
    DOM.toast.textContent = msg;
    DOM.toast.className = `toast show border-${type}`;
    setTimeout(() => {
        DOM.toast.classList.remove('show');
    }, 3000);
}

function switchView(viewId) {
    DOM.views.forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    
    if(viewId !== 'view-login') {
        DOM.sidebar.classList.remove('hidden');
    } else {
        DOM.sidebar.classList.add('hidden');
    }

    // Update active state on sidebar
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    const activeMenu = document.querySelector(`.menu-item[data-view="${viewId}"]`);
    if(activeMenu) activeMenu.classList.add('active');
}

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

// ==========================================
// CONFIGURATION
// ==========================================
const API_URL = "https://script.google.com/macros/s/AKfycbwgWFXnyZNLL35ha-WI1-wuCUYJNGQ1-f8_ioBjQtNXuFxT0AEeqWOMSCcLkYWznEKnyg/exec";

// ==========================================
// AUTH & LOGIN
// ==========================================
DOM.formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = DOM.loginEmail.value.trim();
    const btn = DOM.formLogin.querySelector('button');
    const originalText = btn.innerHTML;
    
    if(email.length < 3 || !email.includes('@')) {
        return showToast("E-mail invalido.", "error");
    }

    btn.innerHTML = `<i data-lucide="loader" class="rotating"></i> Validando...`;
    lucide.createIcons();
    
    try {
        // Requisicao real para o Apps Script
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: "check-user", email: email }),
            headers: {
                "Content-Type": "text/plain;charset=utf-8" // Trick para evitar preflight (CORS) estrito
            }
        });
        
        const data = await response.json();
        
        if (data.ok) {
            state.user = data.user;
            DOM.userDisplayName.textContent = state.user.name;
            showToast(`Bem-vindo, ${state.user.name}!`, "success");
            loadMockData(); // mantemos p/ MVP front (projetos)
            renderDashboard();
            switchView('view-dashboard');
        } else {
            showToast("Acesso negado: e-mail nao reconhecido na aba USERS.", "error");
        }
    } catch (err) {
        console.warn("Erro ao contactar a API real:", err);
        // Fallback em caso de falha de teste local sem HTTPS real
        showToast("Conexao falhou. Acessando modo offline fallback...", "warning");
        state.user = { email, name: email.split('@')[0] };
        DOM.userDisplayName.textContent = state.user.name;
        loadMockData();
        renderDashboard();
        switchView('view-dashboard');
    } finally {
        btn.innerHTML = originalText;
        lucide.createIcons();
    }
});

DOM.btnLogout.addEventListener('click', () => {
    state.user = null;
    state.currentProject = null;
    clearTimer();
    switchView('view-login');
});

// ==========================================
// SIDEBAR NAV
// ==========================================
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = e.currentTarget.getAttribute('data-view');
        switchView(view);
    });
});

document.getElementById('btn-new-proj-dash').addEventListener('click', () => {
    switchView('view-project-new');
});

// ==========================================
// NEW PROJECT FORM
// ==========================================
DOM.projMode.addEventListener('change', (e) => {
    if(e.target.value === 'academico') {
        DOM.camposAcad.classList.remove('hidden');
        DOM.camposPoet.classList.add('hidden');
    } else {
        DOM.camposAcad.classList.add('hidden');
        DOM.camposPoet.classList.remove('hidden');
    }
});

DOM.formNewProj.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('proj-title').value;
    const mode = document.getElementById('proj-mode').value;
    
    const newProject = {
        id: generateId(),
        title,
        mode,
        createdAt: new Date(),
        updatedAt: new Date(),
        content: '',
        meta: {}
    };

    if(mode === 'academico') {
        newProject.meta = {
            genre: document.getElementById('proj-genre').value,
            trail: document.getElementById('proj-trail').value,
            theme: document.getElementById('proj-theme').value,
            objective: document.getElementById('proj-objective').value,
            interlocutor: document.getElementById('proj-interlocutor').value
        };
    } else {
        newProject.meta = {
            sentimento: document.getElementById('proj-sentimento').value,
            substantivo: document.getElementById('proj-substantivo').value,
            ambiente: document.getElementById('proj-ambiente').value
        };
    }

    state.projects.push(newProject);
    showToast("Projeto criado!", "success");
    DOM.formNewProj.reset();
    openEditor(newProject);
});

DOM.btnCancelProj.addEventListener('click', () => {
    switchView('view-dashboard');
});

// ==========================================
// DASHBOARD
// ==========================================
function loadMockData() {
    if(state.projects.length === 0) {
        state.projects = [
            {
                id: 'p1', title: 'A Importância da Leitura', mode: 'academico', 
                content: 'A leitura é fundamental...', 
                meta: { trail: 'corrida', genre: 'artigo' }
            },
            {
                id: 'p2', title: 'O silêncio do mar', mode: 'poetico', 
                content: 'Um mar denso sob o tempo...', 
                meta: {}
            }
        ];
    }
}

function renderDashboard() {
    DOM.statProj.textContent = state.projects.length;
    DOM.statSess.textContent = '3'; // Mock

    DOM.projList.innerHTML = '';
    
    if(state.projects.length === 0) {
        DOM.projList.innerHTML = '<p class="subtitle">Você ainda não tem projetos. Crie um novo para começar.</p>';
        return;
    }

    state.projects.forEach(p => {
        const card = document.createElement('div');
        card.className = 'project-card glass-card';
        card.innerHTML = `
            <span class="project-tag tag-${p.mode}">${p.mode === 'academico' ? 'Acadêmico' : 'Poético'}</span>
            <h3 class="project-title">${p.title}</h3>
            <p class="project-meta">Última edição: hoje</p>
        `;
        card.addEventListener('click', () => openEditor(p));
        DOM.projList.appendChild(card);
    });
}

// ==========================================
// EDITOR
// ==========================================
function openEditor(project) {
    state.currentProject = project;
    DOM.editorTitle.textContent = project.title;
    
    if(project.mode === 'academico') {
        DOM.editorMeta.textContent = `Modo Acadêmico • Trilha: ${project.meta.trail.toUpperCase()} • ${project.meta.genre.toUpperCase()}`;
        DOM.btnAnalyze.classList.remove('hidden');
    } else {
        DOM.editorMeta.textContent = `Modo Poético`;
        DOM.btnAnalyze.classList.add('hidden');
    }

    DOM.mainTextarea.value = project.content || '';
    updateWordCount();
    
    // Close H2 optionally
    DOM.h2Panel.classList.add('closed');
    
    switchView('view-editor');
    startTimer();
}

DOM.btnBackDash.addEventListener('click', () => {
    clearTimer();
    renderDashboard();
    switchView('view-dashboard');
});

// Auto-Save Mock
DOM.mainTextarea.addEventListener('input', () => {
    updateWordCount();
    
    DOM.saveStatus.innerHTML = `<i data-lucide="loader" class="rotating"></i> Salvando...`;
    DOM.saveStatus.classList.replace('saved', 'saving');
    
    clearTimeout(state.saveTimer);
    state.saveTimer = setTimeout(() => {
        if(state.currentProject) {
            state.currentProject.content = DOM.mainTextarea.value;
            DOM.saveStatus.innerHTML = `<i data-lucide="check-circle"></i> Salvo na nuvem`;
            DOM.saveStatus.classList.replace('saving', 'saved');
            lucide.createIcons();
        }
    }, 1000);
});

function updateWordCount() {
    const text = DOM.mainTextarea.value.trim();
    const count = text === '' ? 0 : text.split(/\s+/).length;
    DOM.wordCount.textContent = count === 1 ? '1 palavra' : `${count} palavras`;
}

// Session Timer
function startTimer() {
    state.sessionSeconds = 0;
    DOM.sessionTime.textContent = '00:00';
    state.sessionTimer = setInterval(() => {
        state.sessionSeconds++;
        DOM.sessionTime.textContent = formatTime(state.sessionSeconds);
    }, 1000);
}

function clearTimer() {
    clearInterval(state.sessionTimer);
}

// ==========================================
// MOTOR H2 (MOCK)
// ==========================================
DOM.btnAnalyze.addEventListener('click', () => {
    const content = DOM.mainTextarea.value.trim();
    if(content.split(/\s+/).length < 20) {
        showToast("Escreva ao menos 20 palavras antes de rodar o Motor H2.", "warning");
        return;
    }

    DOM.btnAnalyze.innerHTML = `<i data-lucide="loader"></i> Avaliando...`;
    
    // Simulate API Call Delay
    setTimeout(() => {
        DOM.btnAnalyze.innerHTML = `<i data-lucide="sparkles"></i> Analisar Motor H2`;
        renderH2Diagnosticos();
        DOM.h2Panel.classList.remove('closed');
        lucide.createIcons();
    }, 1500);
});

DOM.btnCloseH2.addEventListener('click', () => {
    DOM.h2Panel.classList.add('closed');
});

function renderH2Diagnosticos() {
    // Math random to randomize mock scores for presentation
    const randomNota = () => Math.floor(Math.random() * 3) + 2; // Returns 2, 3 or 4

    const metrics = [
        { name: "Estrutura e Progressão", val: randomNota(), desc: "Boa introdução, mas falta amarrar a conclusão." },
        { name: "Coesão e Encadeamento", val: randomNota(), desc: "Falta diversidade de conectores." },
        { name: "Argumentação", val: randomNota(), desc: "A tese está clara." }
    ];

    let html = '';
    metrics.forEach(m => {
        const perc = (m.val / 5) * 100;
        let color = '#FBBF24'; // warning
        if(m.val >= 4) color = '#34D399'; // success
        if(m.val <= 2) color = '#EF4444'; // danger

        html += `
        <div class="h2-score-box">
            <div class="h2-score-title">
                <span>${m.name}</span>
                <span class="h2-stars">${'★'.repeat(m.val)}${'☆'.repeat(5-m.val)}</span>
            </div>
            <div class="h2-bar-bg">
                <div class="h2-bar-fill" style="width: ${perc}%; background-color: ${color};"></div>
            </div>
            <div class="h2-explanation">${m.desc}</div>
        </div>
        `;
    });

    html += `
        <div class="h2-action-box">
            <h4>Foco de Revisão</h4>
            <ul class="h2-action-list">
                <li>Experimente usar conectores como "embora" ou "entretanto" para criar ressalvas.</li>
                <li>Reforce sua tese no último parágrafo conectando com a abertura.</li>
            </ul>
        </div>
    `;

    DOM.h2Content.innerHTML = html;
}
