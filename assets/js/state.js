// assets/js/state.js
let appState = {};
const defaultState = {
    activeContext: { type: 'new_chat', id: null },
    courses: [],
    topics: {},
    chats: {},
    ui: { collapsed: {}, sidebarWidth: 300 },
    isAuthenticated: false
};

function saveState() {
    localStorage.setItem('hyperfocusState', JSON.stringify(appState));
    document.dispatchEvent(new CustomEvent('stateChanged'));
}

function loadState() {
    const savedState = localStorage.getItem('hyperfocusState');
    appState = savedState ? JSON.parse(savedState) : JSON.parse(JSON.stringify(defaultState));
    document.dispatchEvent(new CustomEvent('stateChanged'));
}

function getState() {
    return appState;
}

function generateId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function createCourse(name, color = null, icon = null) {
    const course = {
        id: generateId(),
        name: name,
        color: color || getRandomColor(),
        icon: icon || '',
        createdAt: new Date().toISOString()
    };
    appState.courses.push(course);
    appState.topics[course.id] = [];
    saveState();
    return course;
}

function createTopic(courseId, name, color = null, icon = null) {
    const topic = {
        id: generateId(),
        name: name,
        courseId: courseId,
        color: color || getRandomColor(),
        icon: icon || '',
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
        parentType: parentType,
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
    
    // Resetear contexto si es necesario
    if (appState.activeContext.type === 'course' && appState.activeContext.id === courseId) {
        appState.activeContext = { type: 'new_chat', id: null };
    }
    
    saveState();
}

function deleteTopic(topicId) {
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
    
    // Resetear contexto si es necesario
    if (appState.activeContext.type === 'topic' && appState.activeContext.id === topicId) {
        appState.activeContext = { type: 'new_chat', id: null };
    }
    
    saveState();
}

function deleteChat(chatId) {
    delete appState.chats[chatId];
    
    // Resetear contexto si es necesario
    if (appState.activeContext.type === 'chat' && appState.activeContext.id === chatId) {
        appState.activeContext = { type: 'new_chat', id: null };
    }
    
    saveState();
}

function setActiveContext(type, id) {
    appState.activeContext = { type, id };
    saveState();
    document.dispatchEvent(new CustomEvent('contextChanged', { detail: { type, id } }));
}

function getRandomColor() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function findTopicById(topicId) {
    for (const courseId in appState.topics) {
        const topic = appState.topics[courseId].find(t => t.id === topicId);
        if (topic) return topic;
    }
    return null;
}

export { appState, loadState, saveState, getState, generateId, createCourse, createTopic, createChat, deleteCourse, deleteTopic, deleteChat, setActiveContext, getRandomColor, findTopicById };