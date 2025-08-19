// assets/js/components/ChatWindow.js
import { appState, createChat, getState, findTopicById } from '../state.js';
import { fetchChatCompletion } from '../api.js';

// Configure marked.js with highlight.js for syntax highlighting
if (typeof marked !== 'undefined' && typeof hljs !== 'undefined') {
    marked.setOptions({
        highlight: function(code, lang) {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(code, { language: lang }).value;
                } catch (err) {}
            }
            return hljs.highlightAuto(code).value;
        },
        breaks: true,
        gfm: true
    });
}

// Function to render markdown content
function renderMarkdown(content) {
    if (typeof marked === 'undefined') {
        return content; // Fallback to plain text if marked is not available
    }
    
    try {
        let html = marked.parse(content);
        
        // Add copy buttons to code blocks
        html = html.replace(/<pre><code([^>]*)>/g, (match, attributes) => {
            return `<div class="code-block-container"><pre><code${attributes}>`;
        });
        
        html = html.replace(/<\/code><\/pre>/g, '</code></pre><button class="copy-code-btn" onclick="copyCodeBlock(this)">📋 Copiar</button></div>');
        
        return html;
    } catch (error) {
        console.error('Error rendering markdown:', error);
        return content; // Fallback to plain text
    }
}

// Global function to copy code blocks
window.copyCodeBlock = function(button) {
    const codeBlock = button.previousElementSibling.querySelector('code');
    const text = codeBlock.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.textContent;
        button.textContent = '✅ Copiado';
        button.style.background = 'rgba(56, 239, 125, 0.2)';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
        }, 2000);
    }).catch(err => {
        console.error('Error copying code:', err);
        button.textContent = '❌ Error';
        setTimeout(() => {
            button.textContent = '📋 Copiar';
        }, 2000);
    });
};

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
        const messageClass = msg.role === 'user' ? 'user-message' : 'bot-message';
        msgDiv.className = `message ${messageClass}`;
        
        // Apply markdown rendering only to AI messages
        const content = msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content;
        msgDiv.innerHTML = `<div class="message-content">${content}</div>`;
        
        chatHistory.appendChild(msgDiv);
        
        // Apply syntax highlighting to newly added code blocks
        if (msg.role === 'assistant' && typeof hljs !== 'undefined') {
            msgDiv.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        }
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