document.addEventListener('DOMContentLoaded', () => {
    // --- ESTADO Y PERSISTENCIA ---
    let appState = {};
    const defaultState = {
        activeContext: { type: 'new_chat', id: null },
        courses: [],
        topics: {},
        chats: {},
        ui: { collapsed: {} }
    };

    function saveState() {
        localStorage.setItem('hyperfocusState', JSON.stringify(appState));
    }

    function loadState() {
        const savedState = localStorage.getItem('hyperfocusState');
        appState = savedState ? JSON.parse(savedState) : JSON.parse(JSON.stringify(defaultState));
    }

    function generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // --- DOM ELEMENTS ---
    const elements = {
        modal: document.getElementById('custom-prompt-modal'),
        modalTitle: document.getElementById('modal-title'),
        modalInput: document.getElementById('modal-input'),
        modalCancelBtn: document.getElementById('modal-cancel-btn'),
        modalAcceptBtn: document.getElementById('modal-accept-btn'),
        contextMenu: document.getElementById('context-menu'),
        colorPicker: document.getElementById('color-picker'),
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
        sendButton: document.getElementById('send-button'),
        disclaimer: document.getElementById('disclaimer'),
    };

    let modalResolve = null;
    let currentContextMenuTarget = null;

    // --- UTILIDADES ---
    function getRandomColor() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // --- MODALES ---
    function showModal(title, placeholder = '', defaultValue = '') {
        return new Promise((resolve) => {
            modalResolve = resolve;
            elements.modalTitle.textContent = title;
            elements.modalInput.placeholder = placeholder;
            elements.modalInput.value = defaultValue;
            elements.modal.classList.remove('hidden');
            elements.modalInput.focus();
        });
    }

    function hideModal() {
        elements.modal.classList.add('hidden');
        if (modalResolve) {
            modalResolve(null);
            modalResolve = null;
        }
    }

    // --- MENÚ CONTEXTUAL ---
    function showContextMenu(x, y, items, target) {
        hideContextMenu();
        currentContextMenuTarget = target;
        
        elements.contextMenu.innerHTML = '';
        items.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'context-menu-item';
            menuItem.textContent = item.label;
            menuItem.addEventListener('click', () => {
                hideContextMenu();
                item.action();
            });
            elements.contextMenu.appendChild(menuItem);
        });

        elements.contextMenu.style.left = x + 'px';
        elements.contextMenu.style.top = y + 'px';
        elements.contextMenu.classList.remove('hidden');
    }

    function hideContextMenu() {
        elements.contextMenu.classList.add('hidden');
        currentContextMenuTarget = null;
    }

    // --- FUNCIONES DE DATOS ---
    function createCourse(name, color = null) {
        const course = {
            id: generateId(),
            name: name,
            color: color || getRandomColor(),
            createdAt: new Date().toISOString()
        };
        appState.courses.push(course);
        appState.topics[course.id] = [];
        saveState();
        return course;
    }

    function createTopic(courseId, name, color = null) {
        const topic = {
            id: generateId(),
            name: name,
            courseId: courseId,
            color: color || getRandomColor(),
            createdAt: new Date().toISOString()
        };
        if (!appState.topics[courseId]) {
            appState.topics[courseId] = [];
        }
        appState.topics[courseId].push(topic);
        saveState();
        return topic;
    }

    function createChat(parentId = null, parentType = null, name = null) {
        const chat = {
            id: generateId(),
            name: name || `Chat ${Object.keys(appState.chats).length + 1}`,
            parentId: parentId,
            parentType: parentType, // 'course', 'topic', or null for history
            messages: [],
            createdAt: new Date().toISOString()
        };
        appState.chats[chat.id] = chat;
        saveState();
        return chat;
    }

    function deleteCourse(courseId) {
        // Eliminar todos los chats de topics del curso
        if (appState.topics[courseId]) {
            appState.topics[courseId].forEach(topic => {
                Object.keys(appState.chats).forEach(chatId => {
                    if (appState.chats[chatId].parentId === topic.id) {
                        delete appState.chats[chatId];
                    }
                });
            });
        }
        
        // Eliminar chats directos del curso
        Object.keys(appState.chats).forEach(chatId => {
            if (appState.chats[chatId].parentId === courseId) {
                delete appState.chats[chatId];
            }
        });

        // Eliminar topics del curso
        delete appState.topics[courseId];
        
        // Eliminar el curso
        appState.courses = appState.courses.filter(c => c.id !== courseId);
        
        saveState();
    }

    function deleteTopic(topicId) {
        // Encontrar el curso padre
        let courseId = null;
        for (const cId in appState.topics) {
            if (appState.topics[cId].some(t => t.id === topicId)) {
                courseId = cId;
                break;
            }
        }

        if (courseId) {
            // Eliminar chats del topic
            Object.keys(appState.chats).forEach(chatId => {
                if (appState.chats[chatId].parentId === topicId) {
                    delete appState.chats[chatId];
                }
            });

            // Eliminar el topic
            appState.topics[courseId] = appState.topics[courseId].filter(t => t.id !== topicId);
        }
        
        saveState();
    }

    function deleteChat(chatId) {
        delete appState.chats[chatId];
        saveState();
    }

    // --- RENDERIZADO ---
    function render() {
        renderSidebar();
        renderChatView();
    }

    function renderSidebar() {
        elements.coursesList.innerHTML = '';
        elements.historyList.innerHTML = '';
        
        // Renderizar cursos
        appState.courses.forEach(course => {
            elements.coursesList.appendChild(createCourseElement(course));
        });
        
        // Renderizar historial (chats sin padre)
        Object.values(appState.chats)
            .filter(chat => !chat.parentId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .forEach(chat => {
                elements.historyList.appendChild(createChatElement(chat));
            });
    }

    function createCourseElement(course) {
        const li = document.createElement('li');
        li.className = 'sidebar-item';
        li.dataset.id = course.id;
        
        const isCollapsed = appState.ui.collapsed[`course_${course.id}`] !== false;
        
        li.innerHTML = `
            <span class="toggle-arrow ${isCollapsed ? 'collapsed' : ''}">▶</span>
            <span class="color-dot" style="background-color: ${course.color}"></span>
            <span class="item-name">${course.name}</span>
            <button class="item-menu-btn">⋯</button>
        `;

        const toggleArrow = li.querySelector('.toggle-arrow');
        const menuBtn = li.querySelector('.item-menu-btn');
        const itemName = li.querySelector('.item-name');

        // Toggle collapse/expand
        toggleArrow.addEventListener('click', (e) => {
            e.stopPropagation();
            const wasCollapsed = toggleArrow.classList.contains('collapsed');
            toggleArrow.classList.toggle('collapsed');
            appState.ui.collapsed[`topic_${topic.id}`] = wasCollapsed;
            saveState();
            render();
        });

        // Menú contextual
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showContextMenu(e.pageX, e.pageY, [
                { label: 'Añadir Chat', action: () => addChatToTopic(topic.id) },
                { label: 'Renombrar Tema', action: () => renameTopic(topic.id) },
                { label: 'Cambiar Color', action: () => changeTopicColor(topic.id) },
                { label: 'Eliminar Tema', action: () => deleteTopicConfirm(topic.id) }
            ], li);
        });

        // Seleccionar topic
        itemName.addEventListener('click', () => {
            setActiveContext('topic', topic.id);
        });

        // Crear lista anidada si no está colapsado
        if (!isCollapsed) {
            const nestedUl = document.createElement('ul');
            nestedUl.className = 'nested-list expanded';
            
            // Renderizar chats del topic
            const topicChats = Object.values(appState.chats)
                .filter(chat => chat.parentId === topic.id && chat.parentType === 'topic')
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            topicChats.forEach(chat => {
                nestedUl.appendChild(createChatElement(chat));
            });

            li.appendChild(nestedUl);
        }

        return li;
    }

    function createChatElement(chat) {
        const li = document.createElement('li');
        li.className = 'sidebar-item';
        li.dataset.id = chat.id;
        
        if (appState.activeContext.type === 'chat' && appState.activeContext.id === chat.id) {
            li.classList.add('active');
        }

        li.innerHTML = `
            <span class="color-dot" style="background-color: #666; margin-left: 20px;"></span>
            <span class="item-name">${chat.name}</span>
            <button class="item-menu-btn">⋯</button>
        `;

        const menuBtn = li.querySelector('.item-menu-btn');
        const itemName = li.querySelector('.item-name');

        // Menú contextual
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showContextMenu(e.pageX, e.pageY, [
                { label: 'Renombrar Chat', action: () => renameChat(chat.id) },
                { label: 'Eliminar Chat', action: () => deleteChatConfirm(chat.id) }
            ], li);
        });

        // Seleccionar chat
        itemName.addEventListener('click', () => {
            setActiveContext('chat', chat.id);
        });

        return li;
    }

    function renderChatView() {
        updateContextTitle();
        renderMessages();
    }

    function updateContextTitle() {
        let title = 'Hyperfocus AI - Inicio';
        
        if (appState.activeContext.type === 'course') {
            const course = appState.courses.find(c => c.id === appState.activeContext.id);
            if (course) title = `Curso: ${course.name}`;
        } else if (appState.activeContext.type === 'topic') {
            const topic = findTopicById(appState.activeContext.id);
            const course = appState.courses.find(c => c.id === topic?.courseId);
            if (topic && course) {
                title = `Curso: ${course.name} / Tema: ${topic.name}`;
            }
        } else if (appState.activeContext.type === 'chat') {
            const chat = appState.chats[appState.activeContext.id];
            if (chat) {
                if (chat.parentType === 'course') {
                    const course = appState.courses.find(c => c.id === chat.parentId);
                    title = `Curso: ${course?.name} / ${chat.name}`;
                } else if (chat.parentType === 'topic') {
                    const topic = findTopicById(chat.parentId);
                    const course = appState.courses.find(c => c.id === topic?.courseId);
                    title = `Curso: ${course?.name} / Tema: ${topic?.name} / ${chat.name}`;
                } else {
                    title = chat.name;
                }
            }
        }
        
        elements.currentContextTitle.textContent = title;
    }

    function renderMessages() {
        elements.chatHistory.innerHTML = '';
        
        if (appState.activeContext.type === 'chat') {
            const chat = appState.chats[appState.activeContext.id];
            if (chat && chat.messages) {
                chat.messages.forEach(message => {
                    const messageDiv = document.createElement('div');
                    messageDiv.className = `message ${message.role === 'user' ? 'user-message' : 'bot-message'}`;
                    messageDiv.textContent = message.content;
                    elements.chatHistory.appendChild(messageDiv);
                });
            }
        }
        
        // Scroll to bottom
        elements.chatHistory.scrollTop = elements.chatHistory.scrollHeight;
    }

    // --- FUNCIONES DE ACCIONES ---
    function setActiveContext(type, id) {
        // Si es un contexto que no es chat, crear un nuevo chat
        if (type !== 'chat') {
            let parentId = null;
            let parentType = null;
            
            if (type === 'course') {
                parentId = id;
                parentType = 'course';
            } else if (type === 'topic') {
                parentId = id;
                parentType = 'topic';
            }
            
            const newChat = createChat(parentId, parentType);
            appState.activeContext = { type: 'chat', id: newChat.id };
        } else {
            appState.activeContext = { type: type, id: id };
        }
        
        saveState();
        render();
    }

    function findTopicById(topicId) {
        for (const courseId in appState.topics) {
            const topic = appState.topics[courseId].find(t => t.id === topicId);
            if (topic) return topic;
        }
        return null;
    }

    // --- ACCIONES DE CRUD ---
    async function addCourse() {
        const name = await showModal('Nuevo Curso', 'Nombre del curso');
        if (name && name.trim()) {
            createCourse(name.trim());
            render();
        }
    }

    async function addTopic(courseId) {
        const name = await showModal('Nuevo Tema', 'Nombre del tema');
        if (name && name.trim()) {
            createTopic(courseId, name.trim());
            render();
        }
    }

    async function addChatToCourse(courseId) {
        const name = await showModal('Nuevo Chat', 'Nombre del chat');
        if (name && name.trim()) {
            const chat = createChat(courseId, 'course', name.trim());
            setActiveContext('chat', chat.id);
        }
    }

    async function addChatToTopic(topicId) {
        const name = await showModal('Nuevo Chat', 'Nombre del chat');
        if (name && name.trim()) {
            const chat = createChat(topicId, 'topic', name.trim());
            setActiveContext('chat', chat.id);
        }
    }

    async function renameCourse(courseId) {
        const course = appState.courses.find(c => c.id === courseId);
        if (!course) return;
        
        const newName = await showModal('Renombrar Curso', 'Nuevo nombre', course.name);
        if (newName && newName.trim() && newName.trim() !== course.name) {
            course.name = newName.trim();
            saveState();
            render();
        }
    }

    async function renameTopic(topicId) {
        const topic = findTopicById(topicId);
        if (!topic) return;
        
        const newName = await showModal('Renombrar Tema', 'Nuevo nombre', topic.name);
        if (newName && newName.trim() && newName.trim() !== topic.name) {
            topic.name = newName.trim();
            saveState();
            render();
        }
    }

    async function renameChat(chatId) {
        const chat = appState.chats[chatId];
        if (!chat) return;
        
        const newName = await showModal('Renombrar Chat', 'Nuevo nombre', chat.name);
        if (newName && newName.trim() && newName.trim() !== chat.name) {
            chat.name = newName.trim();
            saveState();
            render();
        }
    }

    function changeCourseColor(courseId) {
        const course = appState.courses.find(c => c.id === courseId);
        if (!course) return;
        
        elements.colorPicker.value = course.color;
        elements.colorPicker.onchange = function() {
            course.color = this.value;
            saveState();
            render();
        };
        elements.colorPicker.click();
    }

    function changeTopicColor(topicId) {
        const topic = findTopicById(topicId);
        if (!topic) return;
        
        elements.colorPicker.value = topic.color;
        elements.colorPicker.onchange = function() {
            topic.color = this.value;
            saveState();
            render();
        };
        elements.colorPicker.click();
    }

    async function deleteCourseConfirm(courseId) {
        const course = appState.courses.find(c => c.id === courseId);
        if (!course) return;
        
        if (confirm(`¿Estás seguro de que quieres eliminar el curso "${course.name}"? Esto eliminará todos sus temas y chats.`)) {
            deleteCourse(courseId);
            
            // Si estábamos en un contexto relacionado con este curso, ir a inicio
            if (appState.activeContext.type === 'course' && appState.activeContext.id === courseId) {
                appState.activeContext = { type: 'new_chat', id: null };
            } else if (appState.activeContext.type === 'chat') {
                const chat = appState.chats[appState.activeContext.id];
                if (!chat) {
                    appState.activeContext = { type: 'new_chat', id: null };
                }
            }
            
            render();
        }
    }

    async function deleteTopicConfirm(topicId) {
        const topic = findTopicById(topicId);
        if (!topic) return;
        
        if (confirm(`¿Estás seguro de que quieres eliminar el tema "${topic.name}"? Esto eliminará todos sus chats.`)) {
            deleteTopic(topicId);
            
            // Si estábamos en un contexto relacionado con este tema, ir a inicio
            if (appState.activeContext.type === 'topic' && appState.activeContext.id === topicId) {
                appState.activeContext = { type: 'new_chat', id: null };
            } else if (appState.activeContext.type === 'chat') {
                const chat = appState.chats[appState.activeContext.id];
                if (!chat) {
                    appState.activeContext = { type: 'new_chat', id: null };
                }
            }
            
            render();
        }
    }

    async function deleteChatConfirm(chatId) {
        const chat = appState.chats[chatId];
        if (!chat) return;
        
        if (confirm(`¿Estás seguro de que quieres eliminar el chat "${chat.name}"?`)) {
            deleteChat(chatId);
            
            // Si estábamos en este chat, ir a inicio
            if (appState.activeContext.type === 'chat' && appState.activeContext.id === chatId) {
                appState.activeContext = { type: 'new_chat', id: null };
            }
            
            render();
        }
    }

    // --- CHAT CON IA ---
    async function sendMessage() {
        const userMessage = elements.userInput.value.trim();
        if (!userMessage) return;

        // Si no hay contexto de chat activo, crear uno nuevo
        if (appState.activeContext.type !== 'chat') {
            const newChat = createChat();
            appState.activeContext = { type: 'chat', id: newChat.id };
        }

        const currentChat = appState.chats[appState.activeContext.id];
        if (!currentChat) return;

        // Limpiar input y deshabilitar botón
        elements.userInput.value = '';
        elements.sendButton.disabled = true;
        elements.sendButton.textContent = 'Enviando...';

        // Agregar mensaje del usuario
        currentChat.messages.push({
            role: 'user',
            content: userMessage
        });

        // Si es el primer mensaje, actualizar el nombre del chat
        if (currentChat.messages.length === 1 && currentChat.name.startsWith('Chat ')) {
            currentChat.name = userMessage.substring(0, 30) + (userMessage.length > 30 ? '...' : '');
        }

        saveState();
        render();

        // Mostrar indicador de escritura
        showTypingIndicator();

        try {
            // Preparar mensajes para la API
            const messages = currentChat.messages.map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            // Realizar petición a la API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: elements.modelSelect.value,
                    messages: messages
                })
            });

            hideTypingIndicator();

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.choices && data.choices[0] && data.choices[0].message) {
                // Agregar respuesta del asistente
                currentChat.messages.push({
                    role: 'assistant',
                    content: data.choices[0].message.content
                });
                
                saveState();
                render();
            } else {
                throw new Error('Formato de respuesta inválido');
            }

        } catch (error) {
            hideTypingIndicator();
            console.error('Error al enviar mensaje:', error);
            
            // Agregar mensaje de error
            currentChat.messages.push({
                role: 'assistant',
                content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.'
            });
            
            saveState();
            render();
        }

        // Rehabilitar botón
        elements.sendButton.disabled = false;
        elements.sendButton.textContent = 'Send';
        elements.userInput.focus();
    }

    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        elements.chatHistory.appendChild(typingDiv);
        elements.chatHistory.scrollTop = elements.chatHistory.scrollHeight;
    }

    function hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // --- EVENT LISTENERS ---
    
    // Modal
    elements.modalCancelBtn.addEventListener('click', hideModal);
    elements.modalAcceptBtn.addEventListener('click', () => {
        if (modalResolve) {
            modalResolve(elements.modalInput.value);
            modalResolve = null;
        }
        hideModal();
    });

    elements.modalInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            elements.modalAcceptBtn.click();
        }
    });

    // Cerrar modal y menú contextual al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (e.target === elements.modal) {
            hideModal();
        }
        if (!elements.contextMenu.contains(e.target)) {
            hideContextMenu();
        }
    });

    // Autenticación simulada
    elements.loginBtn.addEventListener('click', () => {
        elements.authButtons.classList.add('hidden');
        elements.sidebar.classList.remove('hidden');
        elements.userInput.focus();
    });

    // Sidebar
    elements.addCourseBtn.addEventListener('click', addCourse);

    // Chat
    elements.sendButton.addEventListener('click', sendMessage);
    elements.userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // --- INICIALIZACIÓN ---
    loadState();
    render();

    // Auto-focus en input cuando se muestra la barra lateral
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && 
                mutation.attributeName === 'class' && 
                !elements.sidebar.classList.contains('hidden')) {
                setTimeout(() => elements.userInput.focus(), 100);
            }
        });
    });
    observer.observe(elements.sidebar, { attributes: true });
});menu-btn">⋯</button>
        `;

        const toggleArrow = li.querySelector('.toggle-arrow');
        const menuBtn = li.querySelector('.item-menu-btn');
        const itemName = li.querySelector('.item-name');

        // Toggle collapse/expand
        toggleArrow.addEventListener('click', (e) => {
            e.stopPropagation();
            const wasCollapsed = toggleArrow.classList.contains('collapsed');
            toggleArrow.classList.toggle('collapsed');
            appState.ui.collapsed[`course_${course.id}`] = wasCollapsed;
            saveState();
            render();
        });

        // Menú contextual
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showContextMenu(e.pageX, e.pageY, [
                { label: 'Añadir Tema', action: () => addTopic(course.id) },
                { label: 'Añadir Chat', action: () => addChatToCourse(course.id) },
                { label: 'Renombrar Curso', action: () => renameCourse(course.id) },
                { label: 'Cambiar Color', action: () => changeCourseColor(course.id) },
                { label: 'Eliminar Curso', action: () => deleteCourseConfirm(course.id) }
            ], li);
        });

        // Seleccionar curso
        itemName.addEventListener('click', () => {
            setActiveContext('course', course.id);
        });

        // Crear lista anidada si no está colapsado
        if (!isCollapsed) {
            const nestedUl = document.createElement('ul');
            nestedUl.className = 'nested-list expanded';
            
            // Renderizar topics
            const topics = appState.topics[course.id] || [];
            topics.forEach(topic => {
                nestedUl.appendChild(createTopicElement(topic));
            });

            // Renderizar chats directos del curso
            const courseChats = Object.values(appState.chats)
                .filter(chat => chat.parentId === course.id && chat.parentType === 'course')
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            courseChats.forEach(chat => {
                nestedUl.appendChild(createChatElement(chat));
            });

            li.appendChild(nestedUl);
        }

        return li;
    }

    function createTopicElement(topic) {
        const li = document.createElement('li');
        li.className = 'sidebar-item';
        li.dataset.id = topic.id;
        
        const isCollapsed = appState.ui.collapsed[`topic_${topic.id}`] !== false;
        
        li.innerHTML = `
            <span class="toggle-arrow ${isCollapsed ? 'collapsed' : ''}">▶</span>
            <span class="color-dot" style="background-color: ${topic.color}"></span>
            <span class="item-name">${topic.name}</span>
            <button class="item-