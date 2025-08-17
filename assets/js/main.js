// assets/js/main.js
import { loadState, saveState, generateId, createCourse, createTopic, createChat, deleteCourse, deleteTopic, deleteChat, setActiveContext, appState } from './state.js';
import { renderSidebar, showContextMenu, hideContextMenu } from './components/Sidebar.js';
import { renderChatWindow, sendMessage } from './components/ChatWindow.js';
import { showModal, hideModal, showConfirmation, showPrompt, showColorPicker, showEmojiPicker } from './components/Modal.js';
import { fetchChatCompletion } from './api.js';

// DOM ELEMENTS
const elements = {
    modal: document.getElementById('custom-prompt-modal'),
    modalTitle: document.getElementById('modal-title'),
    modalInput: document.getElementById('modal-input'),
    modalCancelBtn: document.getElementById('modal-cancel-btn'),
    modalAcceptBtn: document.getElementById('modal-accept-btn'),
    colorPalette: document.getElementById('color-palette'),
    emojiPalette: document.getElementById('emoji-palette'),
    contextMenu: document.getElementById('context-menu'),
    loginBtn: document.getElementById('login-btn'),
    authButtons: document.getElementById('auth-buttons'),
    sidebar: document.getElementById('sidebar'),
    addCourseBtn: document.getElementById('add-course-btn'),
    coursesList: document.getElementById('courses-list'),
    historyList: document.getElementById('history-list'),
    currentContextTitle: document.getElementById('current-context-title'),
    chatHistory: document.getElementById('chat-history'),
    userInput: document.getElementById('user-input'),
    modelSelect: document.getElementById('model-select'),
    sendButton: document.getElementById('send-button')
};



document.addEventListener('DOMContentLoaded', () => {
    loadState();
    updateUIState();
    render();
    initSidebarResizer();

    // Configurar event listeners principales
    document.addEventListener('stateChanged', () => {
        render();
    });

    document.addEventListener('contextChanged', (e) => {
        setActiveContext(e.detail.type, e.detail.id);
    });

    elements.addCourseBtn.addEventListener('click', async () => {
        const name = await showPrompt('Nuevo Curso', 'Nombre del curso');
        if (name) {
            createCourse(name);
            document.dispatchEvent(new CustomEvent('stateChanged'));
        }
    });

    elements.loginBtn.addEventListener('click', () => {
        appState.isAuthenticated = true;
        saveState();
        updateUIState();
        render();
    });

    // Agregar botón de logout en sidebar
    const logoutBtn = document.createElement('button');
    logoutBtn.id = 'logout-btn';
    logoutBtn.textContent = 'Cerrar Sesión';
    logoutBtn.classList.add('auth-btn');
    if (!appState.isAuthenticated) logoutBtn.classList.add('hidden');
    elements.sidebarHeader = document.getElementById('sidebar-header');
    elements.sidebarHeader.appendChild(logoutBtn);
    elements.logoutBtn = logoutBtn;

    logoutBtn.addEventListener('click', () => {
        appState.isAuthenticated = false;
        saveState();
        updateUIState();
        render();
    });

    // Listener para ocultar menú contextual
    document.addEventListener('click', hideContextMenu);

    elements.sendButton.addEventListener('click', sendMessage);
    elements.userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
});

function render() {
    if (appState.isAuthenticated) {
        renderSidebar(appState);
        renderChatWindow(appState);
    } else {
        // Mostrar estado no autenticado
        const chatHistory = document.getElementById('chat-history');
        chatHistory.innerHTML = '<div class="welcome-message">Por favor, inicia sesión para comenzar.</div>';
    }
}

function updateUIState() {
    if (appState.isAuthenticated) {
        elements.sidebar.classList.remove('hidden');
        elements.authButtons.classList.add('hidden');
        if (elements.logoutBtn) elements.logoutBtn.classList.remove('hidden');
    } else {
        elements.sidebar.classList.add('hidden');
        elements.authButtons.classList.remove('hidden');
        if (elements.logoutBtn) elements.logoutBtn.classList.add('hidden');
    }
}



function initSidebarResizer() {
    const resizer = document.getElementById('sidebar-resizer');
    let isResizing = false;
    let startX, startWidth;

    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        startX = e.clientX;
        startWidth = elements.sidebar.offsetWidth;
        document.body.style.cursor = 'col-resize';
    });

    document.addEventListener('mousemove', (e) => {
        if (isResizing) {
            const width = startWidth + e.clientX - startX;
            if (width >= 200 && width <= 500) {
                elements.sidebar.style.width = `${width}px`;
                appState.ui.sidebarWidth = width;
                saveState();
            }
        }
    });

    document.addEventListener('mouseup', () => {
        isResizing = false;
        document.body.style.cursor = 'default';
    });
}