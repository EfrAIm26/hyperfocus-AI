// ColorPicker.js - Componente avanzado de selección de color
export class ColorPicker {
    constructor() {
        this.currentColor = '#DADF77';
        this.currentHue = 60;
        this.currentSaturation = 50;
        this.currentLightness = 70;
        this.resolve = null;
        this.activeTab = 'spectrum';
        
        this.createElement();
        this.setupEventListeners();
    }

    createElement() {
        // Crear el elemento principal del modal
        this.element = document.createElement('div');
        this.element.className = 'color-picker-overlay';
        this.element.style.display = 'none';
        
        this.element.innerHTML = `
            <div class="color-picker-modal">
                <div class="color-picker-header">
                    <div class="color-picker-tabs">
                        <button class="color-picker-tab active" data-tab="spectrum">Espectro</button>
                        <button class="color-picker-tab" data-tab="grid">Cuadrícula</button>
                    </div>
                </div>
                
                <div class="color-picker-content">
                    <!-- Pestaña Espectro -->
                    <div class="color-picker-tab-content" data-tab="spectrum">
                        <div class="color-picker-main">
                            <div class="color-picker-spectrum">
                                <canvas class="color-picker-canvas" width="280" height="200"></canvas>
                                <div class="color-picker-cursor"></div>
                            </div>
                            
                            <div class="color-picker-hue">
                                <div class="color-picker-hue-bar">
                                    <canvas class="color-picker-hue-canvas" width="20" height="200"></canvas>
                                    <div class="color-picker-hue-cursor"></div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="color-picker-preview">
                            <div class="color-picker-preview-color"></div>
                        </div>
                    </div>
                    
                    <!-- Pestaña Cuadrícula -->
                    <div class="color-picker-tab-content hidden" data-tab="grid">
                        <div class="color-picker-grid">
                            ${this.generateColorGrid()}
                        </div>
                    </div>
                </div>
                
                <div class="color-picker-input">
                    <input type="text" class="color-picker-hex" value="#DADF77" maxlength="7">
                </div>
                
                <div class="color-picker-actions">
                    <button class="color-picker-btn color-picker-cancel">Cancelar</button>
                    <button class="color-picker-btn color-picker-save">Guardar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.element);
        
        // Referencias a elementos
        this.canvas = this.element.querySelector('.color-picker-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.hueCanvas = this.element.querySelector('.color-picker-hue-canvas');
        this.hueCtx = this.hueCanvas.getContext('2d');
        this.cursor = this.element.querySelector('.color-picker-cursor');
        this.hueCursor = this.element.querySelector('.color-picker-hue-cursor');
        this.previewColor = this.element.querySelector('.color-picker-preview-color');
        this.hexInput = this.element.querySelector('.color-picker-hex');
        
        this.drawSpectrum();
        this.drawHueBar();
        this.updatePreview();
    }

    generateColorGrid() {
        const colors = [
            '#ff6b6b', '#feca57', '#48dbfb', '#1dd1a1', '#5f27cd',
            '#ff9f43', '#00d2d3', '#54a0ff', '#e056fd', '#ff7979',
            '#badc58', '#30336b', '#95a5a6', '#2c3e50', '#e74c3c',
            '#f39c12', '#3498db', '#2ecc71', '#9b59b6', '#34495e',
            '#f1c40f', '#e67e22', '#1abc9c', '#8e44ad', '#16a085'
        ];
        
        return colors.map(color => 
            `<div class="color-picker-grid-item" data-color="${color}" style="background-color: ${color}"></div>`
        ).join('');
    }

    setupEventListeners() {
        // Pestañas
        this.element.addEventListener('click', (e) => {
            if (e.target.classList.contains('color-picker-tab')) {
                this.switchTab(e.target.dataset.tab);
            }
            
            if (e.target.classList.contains('color-picker-grid-item')) {
                this.selectGridColor(e.target.dataset.color);
            }
            
            if (e.target.classList.contains('color-picker-cancel')) {
                this.cancel();
            }
            
            if (e.target.classList.contains('color-picker-save')) {
                this.save();
            }
        });
        
        // Canvas del espectro
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.updateColorFromCanvas(e);
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.updateColorFromCanvas(e);
            }
        });
        
        // Canvas del hue
        this.hueCanvas.addEventListener('mousedown', (e) => {
            this.isHueDragging = true;
            this.updateHueFromCanvas(e);
        });
        
        this.hueCanvas.addEventListener('mousemove', (e) => {
            if (this.isHueDragging) {
                this.updateHueFromCanvas(e);
            }
        });
        
        // Eventos globales
        document.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.isHueDragging = false;
        });
        
        // Input hexadecimal
        this.hexInput.addEventListener('input', (e) => {
            this.updateColorFromHex(e.target.value);
        });
        
        // Cerrar con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.element.style.display !== 'none') {
                this.cancel();
            }
        });
        
        // Cerrar al hacer clic fuera
        this.element.addEventListener('click', (e) => {
            if (e.target === this.element) {
                this.cancel();
            }
        });
    }

    drawSpectrum() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Crear gradiente de saturación y luminosidad
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const saturation = (x / width) * 100;
                const lightness = 100 - (y / height) * 100;
                
                const color = this.hslToRgb(this.currentHue, saturation, lightness);
                this.ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
                this.ctx.fillRect(x, y, 1, 1);
            }
        }
    }

    drawHueBar() {
        const width = this.hueCanvas.width;
        const height = this.hueCanvas.height;
        
        for (let y = 0; y < height; y++) {
            const hue = (y / height) * 360;
            const color = this.hslToRgb(hue, 100, 50);
            this.hueCtx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
            this.hueCtx.fillRect(0, y, width, 1);
        }
    }

    updateColorFromCanvas(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.currentSaturation = (x / this.canvas.width) * 100;
        this.currentLightness = 100 - (y / this.canvas.height) * 100;
        
        this.updateColor();
        this.updateCursorPosition(x, y);
    }

    updateHueFromCanvas(e) {
        const rect = this.hueCanvas.getBoundingClientRect();
        const y = e.clientY - rect.top;
        
        this.currentHue = (y / this.hueCanvas.height) * 360;
        
        this.drawSpectrum();
        this.updateColor();
        this.updateHueCursorPosition(y);
    }

    updateColorFromHex(hex) {
        if (hex.match(/^#[0-9A-Fa-f]{6}$/)) {
            this.currentColor = hex.toUpperCase();
            const hsl = this.hexToHsl(hex);
            this.currentHue = hsl.h;
            this.currentSaturation = hsl.s;
            this.currentLightness = hsl.l;
            
            this.drawSpectrum();
            this.updatePreview();
            this.updateCursors();
        }
    }

    updateColor() {
        const rgb = this.hslToRgb(this.currentHue, this.currentSaturation, this.currentLightness);
        this.currentColor = this.rgbToHex(rgb.r, rgb.g, rgb.b);
        this.updatePreview();
        this.hexInput.value = this.currentColor;
    }

    updatePreview() {
        this.previewColor.style.backgroundColor = this.currentColor;
    }

    updateCursorPosition(x, y) {
        this.cursor.style.left = `${x - 6}px`;
        this.cursor.style.top = `${y - 6}px`;
    }

    updateHueCursorPosition(y) {
        this.hueCursor.style.top = `${y - 3}px`;
    }

    updateCursors() {
        const x = (this.currentSaturation / 100) * this.canvas.width;
        const y = (1 - this.currentLightness / 100) * this.canvas.height;
        const hueY = (this.currentHue / 360) * this.hueCanvas.height;
        
        this.updateCursorPosition(x, y);
        this.updateHueCursorPosition(hueY);
    }

    switchTab(tab) {
        this.activeTab = tab;
        
        // Actualizar pestañas
        this.element.querySelectorAll('.color-picker-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.tab === tab);
        });
        
        // Actualizar contenido
        this.element.querySelectorAll('.color-picker-tab-content').forEach(content => {
            content.classList.toggle('hidden', content.dataset.tab !== tab);
        });
    }

    selectGridColor(color) {
        this.currentColor = color.toUpperCase();
        this.hexInput.value = this.currentColor;
        this.updatePreview();
        
        const hsl = this.hexToHsl(color);
        this.currentHue = hsl.h;
        this.currentSaturation = hsl.s;
        this.currentLightness = hsl.l;
    }

    // Métodos de conversión de color
    hslToRgb(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;
        
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l;
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    rgbToHex(r, g, b) {
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
    }

    hexToHsl(hex) {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        
        return {
            h: h * 360,
            s: s * 100,
            l: l * 100
        };
    }

    show() {
        return new Promise((resolve) => {
            this.resolve = resolve;
            this.element.style.display = 'flex';
            
            // Resetear a valores por defecto
            this.currentColor = '#DADF77';
            this.hexInput.value = this.currentColor;
            this.updatePreview();
            
            const hsl = this.hexToHsl(this.currentColor);
            this.currentHue = hsl.h;
            this.currentSaturation = hsl.s;
            this.currentLightness = hsl.l;
            
            this.drawSpectrum();
            this.updateCursors();
        });
    }

    save() {
        if (this.resolve) {
            this.resolve(this.currentColor);
            this.resolve = null;
        }
        this.hide();
    }

    cancel() {
        if (this.resolve) {
            this.resolve(null);
            this.resolve = null;
        }
        this.hide();
    }

    hide() {
        this.element.style.display = 'none';
    }

    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}