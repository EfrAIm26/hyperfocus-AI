// assets/js/components/ChatWindow.js
import { appState, createChat, getState, findTopicById } from '../state.js';
import { fetchChatCompletion } from '../api.js';

function renderChatWindow(state) {
    if (!state.isAuthenticated) {
        const chatHistory = document.getElementById('chat-history');
        chatHistory.innerHTML = '<div class="welcome-message">Por favor, inicia sesión para comenzar.</div>';
        return;
    }
    updateContextTitle(state);
    const chatHistory = document.getElementById('chat-history');
    chatHistory.innerHTML = '';
    
    if (state.activeContext.type === 'chat') {
        const chat = state.chats[state.activeContext.id];
        if (chat) {
            renderMessages(chat.messages);
        }
    } else {
        // Mostrar mensaje de bienvenida o vacío
        chatHistory.innerHTML = '<div class="welcome-message">Selecciona un chat o crea uno nuevo.</div>';
    }
}

function updateContextTitle(state) {
    const titleElement = document.getElementById('current-context-title');
    let title = '';
    switch (state.activeContext.type) {
        case 'course':
            const course = state.courses.find(c => c.id === state.activeContext.id);
            title = course ? course.name : 'Nuevo Chat';
            break;
        case 'topic':
            const topic = findTopicById(state.activeContext.id);
            title = topic ? topic.name : 'Nuevo Chat';
            break;
        case 'chat':
            const chat = state.chats[state.activeContext.id];
            title = chat ? chat.name : 'Nuevo Chat';
            break;
        default:
            title = 'Nuevo Chat';
    }
    titleElement.textContent = title;
}

function renderMessages(messages) {
    const chatHistory = document.getElementById('chat-history');
    chatHistory.innerHTML = '';
    messages.forEach(msg => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${msg.role}`;
        msgDiv.innerHTML = `<div class="message-content">${msg.content}</div>`;
        chatHistory.appendChild(msgDiv);
    });
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

async function sendMessage() {
    const userInput = document.getElementById('user-input');
    const modelSelect = document.getElementById('model-select');
    const message = userInput.value.trim();
    const model = modelSelect.value;
    
    if (!message) return;
    
    let chatId = appState.activeContext.id;
    let chat = appState.chats[chatId];
    
    if (appState.activeContext.type !== 'chat' || !chat) {
        // Crear nuevo chat
        let parentId = null;
        let parentType = null;
        if (appState.activeContext.type === 'course') {
            parentId = appState.activeContext.id;
            parentType = 'course';
        } else if (appState.activeContext.type === 'topic') {
            parentId = appState.activeContext.id;
            parentType = 'topic';
        }
        chat = createChat(parentId, parentType, 'Nuevo Chat');
        chatId = chat.id;
        document.dispatchEvent(new CustomEvent('contextChanged', { detail: { type: 'chat', id: chatId } }));
    }
    
    // Añadir mensaje del usuario
    chat.messages.push({ role: 'user', content: message });
    renderMessages(chat.messages);
    userInput.value = '';
    showTypingIndicator();
    
    try {
        const response = await fetchChatCompletion(chat.messages, model);
        chat.messages.push({ role: 'assistant', content: response });
    } catch (error) {
        chat.messages.push({ role: 'assistant', content: 'Error: ' + error.message });
    }
    
    hideTypingIndicator();
    renderMessages(chat.messages);
    document.dispatchEvent(new CustomEvent('stateChanged'));
}

function showTypingIndicator() {
    const chatHistory = document.getElementById('chat-history');
    const indicator = document.createElement('div');
    indicator.className = 'message assistant typing-indicator';
    indicator.innerHTML = '<div class="message-content"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>';
    chatHistory.appendChild(indicator);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

function hideTypingIndicator() {
    const indicator = document.querySelector('.typing-indicator');
    if (indicator) indicator.remove();
}

// Configurar listener para contextChanged
document.addEventListener('contextChanged', () => {
    renderChatWindow(getState());
});

export { renderChatWindow, sendMessage };