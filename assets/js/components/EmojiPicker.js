// EmojiPicker.js - Componente avanzado de selección de emojis
export class EmojiPicker {
    constructor() {
        this.resolve = null;
        this.searchTerm = '';
        
        // Colección curada de emojis para estudio y productividad
        this.emojis = [
            // Educación y estudio
            '📚', '📖', '📝', '✏️', '📄', '📋', '📊', '📈', '📉', '🎓',
            '🔬', '🧪', '🔍', '💡', '🧠', '📐', '📏', '🖊️', '✒️', '🖋️',
            
            // Tecnología y programación
            '💻', '🖥️', '⌨️', '🖱️', '💾', '💿', '📱', '⚡', '🔌', '🛠️',
            '⚙️', '🔧', '🔨', '🖨️', '📡', '🌐', '💻', '🔒', '🔑', '🆔',
            
            // Organización y productividad
            '📅', '📆', '🗓️', '⏰', '⏲️', '⏱️', '📌', '📍', '🎯', '✅',
            '☑️', '✔️', '❌', '⭐', '🌟', '💫', '🔥', '💎', '🏆', '🥇',
            
            // Ciencias y materias
            '🧮', '🔢', '➕', '➖', '✖️', '➗', '🟰', '📐', '📏', '🌍',
            '🌎', '🌏', '🗺️', '🧭', '⚗️', '🔬', '🧬', '🦠', '🧪', '⚛️',
            
            // Arte y creatividad
            '🎨', '🖌️', '🖍️', '✏️', '🖊️', '🎭', '🎪', '🎬', '📷', '📸',
            '🎵', '🎶', '🎼', '🎹', '🎸', '🥁', '🎺', '🎷', '🎻', '🎤',
            
            // Deportes y salud
            '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏓', '🏸', '🥊', '🏃',
            '🚴', '🏊', '🧘', '💪', '🏋️', '🤸', '🏆', '🥇', '🥈', '🥉'
        ];
        
        this.createElement();
        this.setupEventListeners();
    }
    
    createElement() {
        this.element = document.createElement('div');
        this.element.className = 'emoji-picker-modal';
        this.element.style.display = 'none';
        
        this.element.innerHTML = `
            <div class="emoji-picker-content">
                <div class="emoji-picker-header">
                    <h3 class="emoji-picker-title">Seleccionar Icono</h3>
                    <button class="emoji-picker-close">×</button>
                </div>
                
                <div class="emoji-picker-search">
                    <input type="text" class="emoji-picker-search-input" placeholder="Buscar emoji..." maxlength="50">
                </div>
                
                <div class="emoji-picker-grid-container">
                    <div class="emoji-picker-grid">
                        ${this.generateEmojiGrid()}
                    </div>
                </div>
                
                <div class="emoji-picker-actions">
                    <button class="emoji-picker-btn emoji-picker-remove">Remove</button>
                    <button class="emoji-picker-btn emoji-picker-cancel">Cancelar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.element);
        
        // Referencias a elementos
        this.searchInput = this.element.querySelector('.emoji-picker-search-input');
        this.grid = this.element.querySelector('.emoji-picker-grid');
    }
    
    generateEmojiGrid() {
        return this.emojis.map(emoji => 
            `<div class="emoji-picker-item" data-emoji="${emoji}">${emoji}</div>`
        ).join('');
    }
    
    setupEventListeners() {
        // Búsqueda en tiempo real
        this.searchInput.addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.filterEmojis();
        });
        
        // Clicks en el modal
        this.element.addEventListener('click', (e) => {
            // Selección de emoji
            if (e.target.classList.contains('emoji-picker-item')) {
                const emoji = e.target.dataset.emoji;
                this.selectEmoji(emoji);
                return;
            }
            
            // Botón Remove
            if (e.target.classList.contains('emoji-picker-remove')) {
                this.selectEmoji('');
                return;
            }
            
            // Botón Cancelar
            if (e.target.classList.contains('emoji-picker-cancel')) {
                this.cancel();
                return;
            }
            
            // Botón cerrar
            if (e.target.classList.contains('emoji-picker-close')) {
                this.cancel();
                return;
            }
            
            // Click fuera del contenido
            if (e.target === this.element) {
                this.cancel();
                return;
            }
        });
        
        // Tecla Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.element.style.display !== 'none') {
                this.cancel();
            }
        });
    }
    
    filterEmojis() {
        const filteredEmojis = this.emojis.filter(emoji => {
            // Para simplificar, filtramos por posición en el array
            // En una implementación más avanzada, se podría usar un mapa de nombres
            const emojiNames = {
                '📚': 'libro libros estudio',
                '📖': 'libro abierto lectura',
                '📝': 'nota escribir',
                '✏️': 'lapiz escribir',
                '📄': 'documento papel',
                '📋': 'clipboard lista',
                '📊': 'grafico barras',
                '📈': 'grafico subida',
                '📉': 'grafico bajada',
                '🎓': 'graduacion universidad',
                '🔬': 'microscopio ciencia',
                '🧪': 'tubo ensayo quimica',
                '🔍': 'lupa buscar',
                '💡': 'bombilla idea',
                '🧠': 'cerebro mente',
                '💻': 'laptop computadora',
                '🖥️': 'computadora desktop',
                '⌨️': 'teclado',
                '🖱️': 'mouse raton',
                '📱': 'telefono movil',
                '⚡': 'rayo energia',
                '🛠️': 'herramientas',
                '⚙️': 'engranaje configuracion',
                '📅': 'calendario',
                '📆': 'calendario fecha',
                '⏰': 'reloj alarma',
                '📌': 'pin marcador',
                '🎯': 'objetivo meta',
                '✅': 'check correcto',
                '⭐': 'estrella favorito',
                '🔥': 'fuego popular',
                '🏆': 'trofeo ganador',
                '🧮': 'abaco matematicas',
                '🔢': 'numeros matematicas',
                '🌍': 'mundo tierra geografia',
                '🗺️': 'mapa geografia',
                '🎨': 'arte pintura',
                '🖌️': 'pincel arte',
                '🎵': 'musica nota',
                '🎶': 'musica notas',
                '⚽': 'futbol deporte',
                '🏀': 'basquet deporte',
                '💪': 'musculo fuerza',
                '🏃': 'correr deporte'
            };
            
            const searchTerms = emojiNames[emoji] || '';
            return searchTerms.includes(this.searchTerm) || emoji.includes(this.searchTerm);
        });
        
        this.grid.innerHTML = filteredEmojis.map(emoji => 
            `<div class="emoji-picker-item" data-emoji="${emoji}">${emoji}</div>`
        ).join('');
    }
    
    selectEmoji(emoji) {
        this.hide();
        if (this.resolve) {
            this.resolve(emoji);
            this.resolve = null;
        }
    }
    
    cancel() {
        this.hide();
        if (this.resolve) {
            this.resolve(null);
            this.resolve = null;
        }
    }
    
    show() {
        return new Promise((resolve) => {
            this.resolve = resolve;
            this.element.style.display = 'flex';
            
            // Resetear búsqueda
            this.searchInput.value = '';
            this.searchTerm = '';
            this.filterEmojis();
            
            // Focus en el campo de búsqueda
            setTimeout(() => {
                this.searchInput.focus();
            }, 100);
        });
    }
    
    hide() {
        this.element.style.display = 'none';
    }
}