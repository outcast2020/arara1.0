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
// UTILS & EFFECTS
// ==========================================

// --- Efeito Mágico da Arara (Canvas) ---
function initCanvasDust() {
    const canvas = document.getElementById('arara-canvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    
    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }
    
    window.addEventListener('resize', resize);
    resize();
    
    // As cores do cordel / Arara
    const colors = ['#F05A28', '#9C8AFF', '#FCD34D', '#34D399'];
    
    class Particle {
        constructor() {
            this.reset();
            this.y = Math.random() * height; // iniciar em locais aleatorios
        }
        
        reset() {
            this.x = Math.random() * width;
            this.y = height + 10;
            this.size = Math.random() * 3 + 1;
            this.speedY = -(Math.random() * 1 + 0.5);
            this.speedX = (Math.random() - 0.5) * 1.5;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.alpha = Math.random() * 0.5 + 0.1;
            this.sway = Math.random() * Math.PI * 2;
        }
        
        update() {
            this.y += this.speedY;
            this.sway += 0.02;
            this.x += this.speedX + Math.sin(this.sway) * 0.5;
            
            if (this.y < -10 || this.x < -10 || this.x > width + 10) {
                this.reset();
            }
        }
        
        draw() {
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    for(let i=0; i<60; i++) particles.push(new Particle());
    
    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animate);
    }
    animate();
}

// Inicializa os efeitos especiais
initCanvasDust();

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
const API_URL = "https://script.google.com/macros/s/AKfycbyOPtdl9goveBIMkuDNvboPsQ0qsRkzviZBMoZAl0zZxpy1jdNLNU8tBCJvG3gF_W0foA/exec";

// Helper: GET request (sem CORS preflight — seguro para Apps Script)
function apiGet(params) {
    const query = Object.entries(params)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');
    return fetch(`${API_URL}?${query}`, { method: 'GET' }).then(r => r.json());
}

// Helper: POST request (para operações de escrita)
function apiPost(payload) {
    return fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }
    }).then(r => r.json());
}

// ==========================================
// AUTH & LOGIN
// ==========================================

DOM.formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Step 1: Validar e Acessar
    const email = DOM.loginEmail.value.trim();
    const btn = document.getElementById('btn-submit-login');
    const originalText = btn.innerHTML;
    
    if(email.length < 3 || !email.includes('@')) {
        return showToast("E-mail invalido.", "error");
    }

    btn.innerHTML = `<i data-lucide="loader" class="rotating"></i> Validando...`;
    lucide.createIcons();
    
    try {
        // USA GET para evitar CORS preflight com Google Apps Script
        const data = await apiGet({ action: 'check-user', email: email });
        
        if (data.ok) {
            state.user = data.user;
            sessionStorage.setItem('arara_session_token', data.session_token || '');
            DOM.userDisplayName.textContent = state.user.name;
            
            showToast(`Bem-vindo, ${state.user.name}!`, "success");
            switchView('view-dashboard');
            loadProjects();
            
        } else {
            showToast("Acesso negado: e-mail não listado na aba USERS.", "error");
        }
    } catch (err) {
        console.error("Erro de API:", err);
        showToast("Erro na conexão com o servidor. Verifique a internet.", "error");
    } finally {
        btn.innerHTML = `Acessar <i data-lucide="arrow-right"></i>`;
        lucide.createIcons();
    }
});

DOM.btnLogout.addEventListener('click', () => {
    state.user = null;
    state.currentProject = null;
    sessionStorage.removeItem('arara_session_token');
    
    // UI Reset total
    DOM.loginEmail.value = '';
    DOM.loginEmail.disabled = false;
    const btn = document.getElementById('btn-submit-login');
    btn.innerHTML = `Acessar <i data-lucide="arrow-right"></i>`;
    btn.classList.remove('gradient-btn');
    
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

    const btn = DOM.formNewProj.querySelector('button[type="submit"]');
    const originalBtn = btn.innerHTML;
    btn.innerHTML = `<i data-lucide="loader" class="rotating"></i> Criando...`;
    lucide.createIcons();

    // Requisicao real de criação
    fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ 
            action: "create-project", 
            email: state.user.email,
            session_token: sessionStorage.getItem('arara_session_token'),
            project: newProject
        }),
        headers: { "Content-Type": "text/plain;charset=utf-8" }
    })
    .then(res => res.json())
    .then(data => {
        if(data.ok) {
            newProject.id = data.project_id; // Pega o ID gerado no Google Sheets
            state.projects.push(newProject);
            showToast("Projeto criado na nuvem!", "success");
            DOM.formNewProj.reset();
            openEditor(newProject);
        } else {
            showToast("Erro do servidor: " + data.error, "error");
        }
    })
    .catch(err => {
        console.error(err);
        showToast("Falha na rede ao criar projeto.", "error");
    })
    .finally(() => {
        btn.innerHTML = originalBtn;
        lucide.createIcons();
    });
});

DOM.btnCancelProj.addEventListener('click', () => {
    switchView('view-dashboard');
});

// ==========================================
// DASHBOARD
// ==========================================
async function loadProjects() {
    DOM.projList.innerHTML = '<p class="subtitle"><i data-lucide="loader" class="rotating"></i> Sincronizando projetos...</p>';
    lucide.createIcons();
    
    try {
        // Usa GET para evitar CORS
        const data = await apiGet({ 
            action: 'list-projects', 
            email: state.user.email,
            token: sessionStorage.getItem('arara_session_token') || ''
        });
        
        if(data.ok) {
            state.projects = data.projects || [];
            renderDashboard();
        } else {
            showToast("Falha ao ler projetos: " + (data.error || 'erro desconhecido'), "error");
            renderDashboard(); // Renderiza vazio
        }
    } catch(err) {
        console.error("Erro ao carregar projetos:", err);
        showToast("Falha de rede ao listar projetos.", "error");
        renderDashboard();
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

// Auto-Save Real
DOM.mainTextarea.addEventListener('input', () => {
    updateWordCount();
    
    DOM.saveStatus.innerHTML = `<i data-lucide="loader" class="rotating"></i> Salvando...`;
    DOM.saveStatus.classList.replace('saved', 'saving');
    
    clearTimeout(state.saveTimer);
    state.saveTimer = setTimeout(() => {
        if(state.currentProject) {
            state.currentProject.content = DOM.mainTextarea.value;
            const wordC = DOM.mainTextarea.value.trim().split(/\s+/).length;
            
            fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify({ 
                    action: "save-draft", 
                    session_token: sessionStorage.getItem('arara_session_token'),
                    project_id: state.currentProject.id,
                    content: state.currentProject.content,
                    wordCount: wordC
                }),
                headers: { "Content-Type": "text/plain;charset=utf-8" }
            }).then(res => res.json()).then(data => {
                if(data.ok) {
                    DOM.saveStatus.innerHTML = `<i data-lucide="check-circle"></i> Salvo na nuvem`;
                    DOM.saveStatus.classList.replace('saving', 'saved');
                    lucide.createIcons();
                } else {
                    DOM.saveStatus.innerHTML = `<i data-lucide="alert-circle"></i> Erro ao salvar`;
                    DOM.saveStatus.classList.replace('saving', 'error');
                    lucide.createIcons();
                }
            }).catch(err => {
                DOM.saveStatus.innerHTML = `<i data-lucide="wifi-off"></i> Offline (Salvo local)`;
                lucide.createIcons();
            });
        }
    }, 1500); // 1.5s de debounce para evitar flood no Google Apps Script
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
