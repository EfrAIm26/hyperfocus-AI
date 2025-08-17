// assets/js/components/Sidebar.js
import { createCourse, createTopic, createChat, deleteCourse, deleteTopic, deleteChat, getRandomColor, appState, findTopicById } from '../state.js';
import { showPrompt, showColorPicker, showEmojiPicker, showConfirmation } from './Modal.js';

function showContextMenu(x, y, items) {
    const contextMenu = document.getElementById('context-menu');
    contextMenu.innerHTML = '';
    items.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'context-menu-item';
        menuItem.textContent = item.label;
        menuItem.addEventListener('click', () => {
            hideContextMenu();
            item.action();
        });
        contextMenu.appendChild(menuItem);
    });

    contextMenu.style.left = x + 'px';
    contextMenu.style.top = y + 'px';
    contextMenu.classList.remove('hidden');
}

function hideContextMenu() {
    document.getElementById('context-menu').classList.add('hidden');
}

function renderSidebar(state) {
    if (!state.isAuthenticated) return;
    const coursesList = document.getElementById('courses-list');
    const historyList = document.getElementById('history-list');
    coursesList.innerHTML = '';
    historyList.innerHTML = '';
    
    // Renderizar cursos
    state.courses.forEach(course => {
        coursesList.appendChild(createCourseElement(course, state));
    });
    
    // Renderizar historial (chats sin padre)
    Object.values(state.chats)
        .filter(chat => !chat.parentId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .forEach(chat => {
            historyList.appendChild(createChatElement(chat, 0, state));
        });
}

function createCourseElement(course, state) {
    const li = document.createElement('li');
    li.className = 'sidebar-item';
    li.dataset.id = course.id;
    
    const isCollapsed = state.ui.collapsed[`course_${course.id}`] === true;
    const hasChildren = (state.topics[course.id] && state.topics[course.id].length > 0) || 
                       Object.values(state.chats).some(chat => chat.parentId === course.id && chat.parentType === 'course');
    
    li.innerHTML = `
        ${hasChildren ? `<span class="toggle-arrow ${isCollapsed ? 'collapsed' : ''}" style="margin-left: 0px;">▼</span>` : '<span class="toggle-spacer" style="width: 16px; display: inline-block;"></span>'}
        <span class="color-dot" style="background-color: ${course.color}"></span>
        <span class="item-name">${course.icon ? course.icon + ' ' : ''}${course.name}</span>
        <button class="item-menu-btn">⋯</button>
    `;

    const toggleArrow = li.querySelector('.toggle-arrow');
    const menuBtn = li.querySelector('.item-menu-btn');
    const itemName = li.querySelector('.item-name');

    // Toggle collapse/expand
    if (toggleArrow) {
        toggleArrow.addEventListener('click', (e) => {
            e.stopPropagation();
            const wasCollapsed = toggleArrow.classList.contains('collapsed');
            toggleArrow.classList.toggle('collapsed');
            state.ui.collapsed[`course_${course.id}`] = !wasCollapsed;
            // Save state and emit event
            document.dispatchEvent(new CustomEvent('stateChanged'));
            renderSidebar(state);
        });
    }

    // Menú contextual
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showContextMenu(e.pageX, e.pageY, [
            { label: 'Añadir Tema', action: () => addTopic(course.id) },
            { label: 'Añadir Chat', action: () => addChatToCourse(course.id) },
            { label: 'Renombrar', action: () => renameCourse(course.id) },
            { label: 'Cambiar Color', action: () => changeCourseColor(course.id) },
            { label: 'Cambiar Icono', action: () => changeCourseIcon(course.id) },
            { label: 'Eliminar', action: () => deleteCourseConfirm(course.id) }
        ]);
    });

    // Seleccionar curso
    itemName.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('contextChanged', { detail: { type: 'course', id: course.id } }));
    });

    // Crear lista anidada si no está colapsado y tiene hijos
    if (!isCollapsed && hasChildren) {
        const nestedUl = document.createElement('ul');
        nestedUl.className = 'nested-list expanded';
        nestedUl.style.marginLeft = '24px';
        
        // Renderizar topics
        const topics = state.topics[course.id] || [];
        topics.forEach(topic => {
            nestedUl.appendChild(createTopicElement(topic, state));
        });

        // Renderizar chats directos del curso
        const courseChats = Object.values(state.chats)
            .filter(chat => chat.parentId === course.id && chat.parentType === 'course')
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        courseChats.forEach(chat => {
            nestedUl.appendChild(createChatElement(chat, 1, state));
        });

        li.appendChild(nestedUl);
    }

    return li;
}

function createTopicElement(topic, state) {
    const li = document.createElement('li');
    li.className = 'sidebar-item';
    li.dataset.id = topic.id;
    
    const isCollapsed = state.ui.collapsed[`topic_${topic.id}`] === true;
    const hasChats = Object.values(state.chats).some(chat => chat.parentId === topic.id && chat.parentType === 'topic');
    
    li.innerHTML = `
        ${hasChats ? `<span class="toggle-arrow ${isCollapsed ? 'collapsed' : ''}" style="margin-left: 0px;">▼</span>` : '<span class="toggle-spacer" style="width: 16px; display: inline-block;"></span>'}
        <span class="color-dot" style="background-color: ${topic.color}"></span>
        <span class="item-name">${topic.icon ? topic.icon + ' ' : ''}${topic.name}</span>
        <button class="item-menu-btn">⋯</button>
    `;

    const toggleArrow = li.querySelector('.toggle-arrow');
    const menuBtn = li.querySelector('.item-menu-btn');
    const itemName = li.querySelector('.item-name');

    // Toggle collapse/expand
    if (toggleArrow) {
        toggleArrow.addEventListener('click', (e) => {
            e.stopPropagation();
            const wasCollapsed = toggleArrow.classList.contains('collapsed');
            toggleArrow.classList.toggle('collapsed');
            state.ui.collapsed[`topic_${topic.id}`] = !wasCollapsed;
            document.dispatchEvent(new CustomEvent('stateChanged'));
            renderSidebar(state);
        });
    }

    // Menú contextual
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showContextMenu(e.pageX, e.pageY, [
            { label: 'Añadir Chat', action: () => addChatToTopic(topic.id) },
            { label: 'Renombrar', action: () => renameTopic(topic.id) },
            { label: 'Cambiar Color', action: () => changeTopicColor(topic.id) },
            { label: 'Cambiar Icono', action: () => changeTopicIcon(topic.id) },
            { label: 'Eliminar', action: () => deleteTopicConfirm(topic.id) }
        ]);
    });

    // Seleccionar topic
    itemName.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('contextChanged', { detail: { type: 'topic', id: topic.id } }));
    });

    // Crear lista anidada si no está colapsado y tiene chats
    if (!isCollapsed && hasChats) {
        const nestedUl = document.createElement('ul');
        nestedUl.className = 'nested-list expanded';
        nestedUl.style.marginLeft = '24px';
        
        // Renderizar chats del topic
        const topicChats = Object.values(state.chats)
            .filter(chat => chat.parentId === topic.id && chat.parentType === 'topic')
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        topicChats.forEach(chat => {
            nestedUl.appendChild(createChatElement(chat, 2, state));
        });

        li.appendChild(nestedUl);
    }

    return li;
}

function createChatElement(chat, level = 0, state) {
    const li = document.createElement('li');
    li.className = 'sidebar-item';
    li.dataset.id = chat.id;
    
    li.innerHTML = `
        <span class="toggle-spacer" style="width: ${level * 24}px; display: inline-block;"></span>
        <span class="item-name">${chat.name}</span>
        <button class="item-menu-btn">⋯</button>
    `;

    const menuBtn = li.querySelector('.item-menu-btn');
    const itemName = li.querySelector('.item-name');

    // Menú contextual para chat
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showContextMenu(e.pageX, e.pageY, [
            { label: 'Renombrar', action: () => renameChat(chat.id) },
            { label: 'Eliminar', action: () => deleteChatConfirm(chat.id) }
        ]);
    });

    // Seleccionar chat
    itemName.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('contextChanged', { detail: { type: 'chat', id: chat.id } }));
    });

    return li;
}

// Funciones auxiliares para acciones del menú
async function addTopic(courseId) {
    const name = await showPrompt('Nuevo Tema', 'Nombre del tema');
    if (name) createTopic(courseId, name);
}

async function addChatToCourse(courseId) {
    const name = await showPrompt('Nuevo Chat', 'Nombre del chat');
    if (name) createChat(courseId, 'course', name);
}

async function addChatToTopic(topicId) {
    const name = await showPrompt('Nuevo Chat', 'Nombre del chat');
    if (name) createChat(topicId, 'topic', name);
}

async function renameCourse(courseId) {
    const course = appState.courses.find(c => c.id === courseId);
    const newName = await showPrompt('Renombrar Curso', 'Nuevo nombre', course.name);
    if (newName) {
        course.name = newName;
        document.dispatchEvent(new CustomEvent('stateChanged'));
    }
}

async function changeCourseColor(courseId) {
    const course = appState.courses.find(c => c.id === courseId);
    const newColor = await showColorPicker('Seleccionar Color', course.color);
    if (newColor) {
        course.color = newColor;
        document.dispatchEvent(new CustomEvent('stateChanged'));
    }
}

async function changeCourseIcon(courseId) {
    const course = appState.courses.find(c => c.id === courseId);
    const newIcon = await showEmojiPicker('Seleccionar Icono', course.icon);
    if (newIcon) {
        course.icon = newIcon;
        document.dispatchEvent(new CustomEvent('stateChanged'));
    }
}

async function deleteCourseConfirm(courseId) {
    const confirmed = await showConfirmation('¿Eliminar este curso y todo su contenido?');
    if (confirmed) deleteCourse(courseId);
}

// Similar functions for topic and chat...
async function renameTopic(topicId) {
    const topic = findTopicById(topicId);
    const newName = await showPrompt('Renombrar Tema', 'Nuevo nombre', topic.name);
    if (newName) {
        topic.name = newName;
        document.dispatchEvent(new CustomEvent('stateChanged'));
    }
}

async function changeTopicColor(topicId) {
    const topic = findTopicById(topicId);
    const newColor = await showColorPicker('Seleccionar Color', topic.color);
    if (newColor) {
        topic.color = newColor;
        document.dispatchEvent(new CustomEvent('stateChanged'));
    }
}

async function changeTopicIcon(topicId) {
    const topic = findTopicById(topicId);
    const newIcon = await showEmojiPicker('Seleccionar Icono', topic.icon);
    if (newIcon) {
        topic.icon = newIcon;
        document.dispatchEvent(new CustomEvent('stateChanged'));
    }
}

async function deleteTopicConfirm(topicId) {
    const confirmed = await showConfirmation('¿Eliminar este tema y sus chats?');
    if (confirmed) deleteTopic(topicId);
}

async function renameChat(chatId) {
    const chat = appState.chats[chatId];
    const newName = await showPrompt('Renombrar Chat', 'Nuevo nombre', chat.name);
    if (newName) {
        chat.name = newName;
        document.dispatchEvent(new CustomEvent('stateChanged'));
    }
}

async function deleteChatConfirm(chatId) {
    const confirmed = await showConfirmation('¿Eliminar este chat?');
    if (confirmed) deleteChat(chatId);
}

export { renderSidebar, showContextMenu, hideContextMenu };