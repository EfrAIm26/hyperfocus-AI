// assets/js/components/Modal.js
let modalResolve = null;

function showModal(title, placeholder = '', defaultValue = '', isConfirmation = false) {
    return new Promise((resolve) => {
        modalResolve = resolve;
        const modal = document.getElementById('custom-prompt-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalInput = document.getElementById('modal-input');
        const modalAcceptBtn = document.getElementById('modal-accept-btn');
        const modalCancelBtn = document.getElementById('modal-cancel-btn');
        
        modalTitle.textContent = title;
        modal.dataset.mode = isConfirmation ? 'confirm' : 'prompt';
        
        if (isConfirmation) {
            modalInput.style.display = 'none';
            modalAcceptBtn.textContent = 'Confirmar';
            modalCancelBtn.textContent = 'Cancelar';
        } else {
            modalInput.style.display = 'block';
            modalInput.placeholder = placeholder;
            modalInput.value = defaultValue;
            modalAcceptBtn.textContent = 'Aceptar';
            modalCancelBtn.textContent = 'Cancelar';
            setTimeout(() => modalInput.focus(), 100);
        }
        
        hideVisualPalettes();
        modal.classList.remove('hidden');
    });
}

function hideModal() {
    const modal = document.getElementById('custom-prompt-modal');
    const modalInput = document.getElementById('modal-input');
    modal.classList.add('hidden');
    modalInput.value = '';
    modalInput.style.display = 'block';
    hideVisualPalettes();
    if (modalResolve) {
        modalResolve(null);
        modalResolve = null;
    }
}

function hideVisualPalettes() {
    const colorPalette = document.getElementById('color-palette');
    const emojiPalette = document.getElementById('emoji-palette');
    if (colorPalette) colorPalette.style.display = 'none';
    if (emojiPalette) emojiPalette.style.display = 'none';
}

function showConfirmation(message) {
    return showModal(message, '', '', true);
}

function showPrompt(title, placeholder = '', defaultValue = '') {
    return showModal(title, placeholder, defaultValue, false);
}

function showColorPicker(title, currentColor = '#ff6b6b') {
    return new Promise((resolve) => {
        modalResolve = resolve;
        const modal = document.getElementById('custom-prompt-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalInput = document.getElementById('modal-input');
        const colorPalette = document.getElementById('color-palette');
        
        modalTitle.textContent = title;
        modal.dataset.mode = 'color';
        modalInput.style.display = 'none';
        colorPalette.style.display = 'grid';
        document.getElementById('emoji-palette').style.display = 'none';
        
        // Clear previous selections
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Mark current color as selected
        const currentOption = document.querySelector(`[data-color="${currentColor}"]`);
        if (currentOption) currentOption.classList.add('selected');
        
        // Add click listeners
        const colorOptions = document.querySelectorAll('.color-option');
        colorOptions.forEach(option => {
            option.onclick = () => {
                document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                const selectedColor = option.dataset.color;
                modal.classList.add('hidden');
                hideVisualPalettes();
                resolve(selectedColor);
                modalResolve = null;
            };
        });
        
        modal.classList.remove('hidden');
    });
}

function showEmojiPicker(title, currentEmoji = '') {
    return new Promise((resolve) => {
        modalResolve = resolve;
        const modal = document.getElementById('custom-prompt-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalInput = document.getElementById('modal-input');
        const emojiPalette = document.getElementById('emoji-palette');
        
        modalTitle.textContent = title;
        modal.dataset.mode = 'emoji';
        modalInput.style.display = 'none';
        document.getElementById('color-palette').style.display = 'none';
        emojiPalette.style.display = 'grid';
        
        // Clear previous selections
        document.querySelectorAll('.emoji-option').forEach(option => option.classList.remove('selected'));
        
        // Mark current emoji as selected
        if (currentEmoji) {
            const currentOption = document.querySelector(`[data-emoji="${currentEmoji}"]`);
            if (currentOption) currentOption.classList.add('selected');
        }
        
        // Add click listeners
        const emojiOptions = document.querySelectorAll('.emoji-option');
        emojiOptions.forEach(option => {
            option.onclick = () => {
                document.querySelectorAll('.emoji-option').forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                const selectedEmoji = option.dataset.emoji;
                modal.classList.add('hidden');
                hideVisualPalettes();
                resolve(selectedEmoji);
                modalResolve = null;
            };
        });
        
        modal.classList.remove('hidden');
    });
}

// Configurar listeners para botones de modal (llamado desde main.js, pero para completitud)
const modalAcceptBtn = document.getElementById('modal-accept-btn');
const modalCancelBtn = document.getElementById('modal-cancel-btn');
modalAcceptBtn.addEventListener('click', () => {
    if (modalResolve) {
        const modal = document.getElementById('custom-prompt-modal');
        const mode = modal.dataset.mode;
        const modalInput = document.getElementById('modal-input');
        if (mode === 'prompt') modalResolve(modalInput.value);
        else if (mode === 'confirm') modalResolve(true);
        // color y emoji manejados en sus funciones
        hideModal();
    }
});

modalCancelBtn.addEventListener('click', () => {
    if (modalResolve) {
        const modal = document.getElementById('custom-prompt-modal');
        const mode = modal.dataset.mode;
        modalResolve(mode === 'confirm' ? false : null);
        hideModal();
    }
});

export { showModal, hideModal, showConfirmation, showPrompt, showColorPicker, showEmojiPicker };