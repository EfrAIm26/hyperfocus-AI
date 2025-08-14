document.addEventListener('DOMContentLoaded', () => {
    // --- ESTADO Y PERSISTENCIA ---
    let appState = {};
    const defaultState = {
        activeContext: { type: 'new_chat', id: null },
        courses: [], topics: {}, chats: {},
        ui: { collapsed: {} }
    };

    function saveState() {
        localStorage.setItem('hyperfocusState', JSON.stringify(appState));
    }

    function loadState() {
        const savedState = localStorage.getItem('hyperfocusState');
        appState = savedState ? JSON.parse(savedState) : JSON.parse(JSON.stringify(defaultState));
    }

    // --- DOM ELEMENTS ---
    const elements = {
        modal: document.getElementById('custom-prompt-modal'), modalTitle: document.getElementById('modal-title'), modalInput: document.getElementById('modal-input'), modalCancelBtn: document.getElementById('modal-cancel-btn'), modalAcceptBtn: document.getElementById('modal-accept-btn'),
        contextMenu: document.getElementById('context-menu'), colorPicker: document.getElementById('color-picker'),
        loginBtn: document.getElementById('login-btn'), authButtons: document.getElementById('auth-buttons'), sidebar: document.getElementById('sidebar'),
        addCourseBtn: document.getElementById('add-course-btn'), coursesList: document.getElementById('courses-list'), historyList: document.getElementById('history-list'),
        currentContextTitle: document.getElementById('current-context-title'), chatHistory: document.getElementById('chat-history'),
        userInput: document.getElementById('user-input'), modelSelect: document.getElementById('model-select'), sendButton: document.getElementById('send-button'), disclaimer: document.getElementById('disclaimer'),
    };

    let modalResolve = null;

    // --- RENDERIZADO ---
    function render() {
        renderSidebar();
        renderChatView();
    }

    function renderSidebar() {
        elements.coursesList.innerHTML = '';
        elements.historyList.innerHTML = '';
        appState.courses.forEach(course => elements.coursesList.appendChild(createCourseElement(course)));
        Object.values(appState.chats).filter(c => !c.parentId).forEach(chat => elements.historyList.appendChild(createChatElement(chat)));
    }
    
    // ... (El resto de funciones y lógica va aquí, este es un placeholder)
    
    // --- INICIALIZACIÓN ---
    loadState();
    render();

    elements.loginBtn.addEventListener('click', () => {
        elements.authButtons.classList.add('hidden');
        elements.sidebar.classList.remove('hidden');
    });

    // ... (El resto de los event listeners)
});