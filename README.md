# ARARA — Laboratório de Versos Semióticos

> Plataforma de autoria pedagógica integrada ao ecossistema Google, com Motor H2 de diagnóstico textual determinístico.

🔗 **Deploy:** [https://outcast2020.github.io/arara1.0/](https://outcast2020.github.io/arara1.0/)  
🔧 **Backend:** Google Apps Script (privado — não versionado neste repo)  
📊 **Banco de dados:** Google Sheets (planilha do Laboratório)

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | HTML + CSS Vanilla + JavaScript puro |
| UI Library | Lucide Icons, Google Fonts (Outfit + Inter) |
| Backend | Google Apps Script (Web App) |
| Banco | Google Sheets (USERS, PROJECTS, DRAFTS, SESSIONS, ANALYSES, EVENTS) |
| Deploy | GitHub Pages |
| Auth | Whitelist por e-mail via `IMPORTRANGE` da planilha mestra do Laboratório |
| CORS | JSONP via `<script>` injection para contornar redirect do Apps Script |

---

## Arquitetura

```
GitHub Pages (frontend)
    │
    ├── index.html      → SPA estrutural
    ├── style.css       → Design system dark glassmorphism
    ├── app.js          → Lógica de SPA, auth, navegação, editor, autosave
    └── analysis.js     → Motor H2 v0.1 (determinístico, offline, extensível)
         │
         └── GET ?action=check-user&callback=_araraCallback_xxx
         └── GET ?action=list-projects&email=...&callback=...
         └── POST action=create-project
         └── POST action=save-draft
              │
              ▼
         Google Apps Script (doGet / doPost)
              │
              ▼
         Google Sheets
              ├── USERS     ← espelhado via IMPORTRANGE da planilha mestra
              ├── PROJECTS
              ├── DRAFTS
              ├── SESSIONS  (estrutura criada, sem escrita ainda)
              ├── ANALYSES  (estrutura criada, sem escrita ainda)
              └── EVENTS    (estrutura criada, sem escrita ainda)
```

---

## O que está funcionando ✅

### Autenticação
- [x] Login por e-mail validado contra whitelist do Laboratório (via IMPORTRANGE)
- [x] Session token gerado no backend e guardado em `sessionStorage`
- [x] Logout com reset completo de estado e UI
- [x] Sem fallback inseguro — conexão falha = acesso negado
- [x] CORS resolvido via JSONP para chamadas GET

### Dashboard
- [x] Listagem real de projetos do usuário via `list-projects`
- [x] Contador de projetos (dado real do banco)
- [x] Estado vazio tratado com mensagem adequada

### Editor
- [x] Criação de projeto com metadados (gênero, trilha, tema, objetivo, interlocutor)
- [x] Modos: Acadêmico e Poético
- [x] Autosave real com debounce de 1.5s → grava em DRAFTS
- [x] Indicador visual de estado: Salvando... / Salvo na nuvem / Offline
- [x] Contador de palavras em tempo real
- [x] Timer de sessão ativo durante a escrita
- [x] Restauração do último rascunho ao abrir o projeto

### Motor H2 (Determinístico v0.1)
- [x] 6 eixos de análise: Situação de Escrita, Estrutura, Coesão, Argumentação, Estilo, Curadoria
- [x] Marcadores linguísticos detectados no texto (conectores, tese, exemplificação, conclusão...)
- [x] Pesos por gênero (artigo, dissertativo, relato, resenha, crônica)
- [x] Regras por trilha (Praia / Corrida / Himalaias)
- [x] Alertas automáticos para violações de regra
- [x] Foco de revisão nos 2 eixos mais fracos com prompt explicativo
- [x] Nota global de 1 a 5 estrelas
- [x] Painel lateral deslizante com resultado

### Visual / UX
- [x] Design dark glassmorphism premium
- [x] Partículas animadas no fundo (Canvas)
- [x] Animações micro-interativas (hover, float, fade)
- [x] Sidebar responsiva com menu de navegação
- [x] Toast de feedback contextual (sucesso, erro, aviso)

---

## O que ainda falta fazer ⚠️

### Crítico (bloqueia produção real)

- [ ] **Login JSONP em produção** — o `doGet` do Apps Script precisa retornar `callback(json)` quando o parâmetro `callback` estiver presente. Verificar se a implantação atual responde corretamente ao padrão JSONP antes de lançar para turmas.
- [ ] **Enforce de trilha no editor** — as regras de mínimo/máximo de palavras existem no `analysis.js` mas não estão aplicadas no editor (sem alerta visual durante a escrita, sem bloqueio de submissão).
- [ ] **Sessão com expiração** — o `session_token` é gerado mas nunca validado nas chamadas subsequentes. Qualquer chamada POST é aceita sem verificar se o token é válido.

### Alta prioridade

- [ ] **Modo Poético** — a UI existe mas não há Motor H2 adaptado para poesia. O botão "Analisar" está oculto no modo poético, mas nenhum feedback poético foi implementado.
- [ ] **Persistência do conteúdo no carregamento** — ao abrir um projeto do dashboard, o último rascunho é buscado em DRAFTS apenas via `list-projects`. Se o projeto tiver muitos rascunhos, pode haver lentidão; não há paginação ou lazy load.
- [ ] **Histórico de versões** — o botão "Histórico" existe no editor mas não faz nada (sem listener implementado).
- [ ] **Logout em inatividade** — não existe timer de sessão do lado do cliente que force logout após tempo sem interação.
- [ ] **Contador de sessões real** — o dashboard mostra "3" mockado como contagem de sessões. Precisa ser lido da aba SESSIONS.

### Motor H2 — Calibração

- [ ] **Calibrar listas de MARKERS** com textos reais de alunos do Laboratório
- [ ] **Calibrar GENRE_WEIGHTS** — os pesos foram estimados, precisam de validação pedagógica
- [ ] **Calibrar TRAIL_RULES** — mínimos e máximos pedagógicos a revisar com a equipe
- [ ] **Calibrar `score1to5()`** — os thresholds de nota precisam ser testados com amostras reais
- [ ] **Feedback em linguagem natural** — os prompts de revisão são genéricos. Futuramente uma camada de IA pode reescrever em linguagem mais próxima do aluno, sem alterar o motor central
- [ ] **Gravação das análises em ANALYSES** — o resultado do Motor H2 nunca é persistido; a aba ANALYSES existe no schema mas nenhuma rota de backend a escreve

### Importante

- [ ] **Modularização do frontend** — `app.js` concentra auth, navegação, editor, autosave, análise. Ideal separar em `auth.js`, `api.js`, `dashboard.js`, `editor.js`
- [ ] **Tratamento de erros do backend no PROJECTS** — se as abas PROJECTS ou DRAFTS não existirem na planilha, o backend retorna `{ ok: false, error: ... }` mas o frontend não guia o usuário a executar o `setupBackendSheet()`
- [ ] **Página 404 / acesso restrito** — não há tratamento para usuário que tenta acessar a URL diretamente já logado (sessão não é restaurada ao recarregar a página)
- [ ] **Responsividade mobile** — o layout foi projetado para desktop; a sidebar e o editor precisam de breakpoints mobile
- [ ] **Aviso de Node.js 20 no GitHub Actions** — as actions `checkout@v4` e `upload-artifact@v4` usam Node.js 20 que será depreciado. Migrar para Node.js 24 até setembro/2026

### Estratégico (futuro)

- [ ] **Análise guardada e comparável** — permitir que o aluno veja a evolução das notas entre sessões
- [ ] **Multiusuário real com dashboard do professor** — hoje não há visão agregada do professor sobre turmas
- [ ] **Gamificação** — o conceito original do ARARA inclui elementos de progressão (trilhas, conquistas)
- [ ] **Integração com IA para reescrita do feedback** — a arquitetura foi planejada para isso; o motor determinístico é o núcleo estável
- [ ] **Exportação do texto** — não há botão para exportar o rascunho como `.txt` ou `.docx`

---

## Como executar localmente

```bash
# Não há build step — é HTML/JS/CSS puro
# Basta servir localmente com qualquer servidor estático:

npx serve .
# ou
python -m http.server 8000
```

> **Nota:** O login exige conexão com o Google Apps Script. Sem o backend configurado, o login falhará (sem fallback intencional por segurança).

---

## Estrutura de pastas

```
Arara 1.0/
├── index.html         → SPA principal
├── style.css          → Design system completo
├── app.js             → Lógica do SPA
├── analysis.js        → Motor H2 v0.1
├── imagem/            → Assets visuais (logos, favicon, banner)
├── doc tecnica/       → Especificação do Modo Acadêmico MVP
└── README.md          → Este arquivo
```

> `code.gs` (backend Apps Script) não está versionado neste repositório por segurança.  
> O código completo do backend é mantido diretamente no editor do Google Apps Script.

---

## Versão

`1.0.0-mvp` — Motor H2 v0.1 integrado  
Última atualização: Abril 2026
