# 🎯 Hyperfocus AI

**Una aplicación de chat inteligente para estudiantes con organización avanzada y IA integrada**

Hyperfocus AI es una plataforma de estudio moderna que combina la potencia de la inteligencia artificial con una interfaz intuitiva para ayudar a los estudiantes a organizar sus materias, temas y conversaciones de estudio de manera eficiente.

## ✨ Funcionalidades Clave

### 🗂️ Organización Jerárquica
- **Cursos**: Organiza tus materias principales
- **Temas**: Subdivide cada curso en temas específicos
- **Chats**: Conversaciones de IA contextualizadas por tema
- **Historial**: Acceso rápido a conversaciones recientes

### 🎨 Interfaz Moderna
- **Sidebar Redimensionable**: Ajusta el espacio de trabajo a tu preferencia
- **Indicadores de Color**: Barras verticales para identificación visual rápida
- **Avatar Dinámico**: Perfil personalizado con gradientes animados
- **Modales Personalizados**: Experiencia de usuario consistente

### 🤖 IA Integrada
- **OpenRouter API**: Acceso a múltiples modelos de IA
- **Contexto Inteligente**: Conversaciones organizadas por materia y tema
- **Historial Persistente**: Todas las conversaciones se guardan localmente

### 🎯 Experiencia de Usuario
- **Breadcrumbs Dinámicos**: Navegación contextual clara
- **Selector de Colores Visual**: Paleta de 12 colores predefinidos
- **Responsive Design**: Adaptable a diferentes tamaños de pantalla
- **Persistencia Local**: Estado de la aplicación guardado automáticamente

## 🛠️ Stack Tecnológico

### Frontend
- **HTML5**: Estructura semántica moderna
- **CSS3**: Estilos avanzados con variables CSS y animaciones
- **JavaScript ES6+**: Lógica de aplicación con async/await y módulos

### APIs y Servicios
- **OpenRouter API**: Integración con modelos de IA
- **LocalStorage**: Persistencia de datos del lado del cliente

### Herramientas de Desarrollo
- **Python HTTP Server**: Servidor de desarrollo local
- **Git**: Control de versiones

## 📁 Estructura del Proyecto

```
hyperfocus-AI/
├── 📄 index.html              # Página principal
├── 📄 README.md               # Documentación
├── 📁 assets/
│   ├── 📁 css/
│   │   └── 📄 style.css       # Estilos principales
│   └── 📁 js/
│       ├── 📄 main.js         # Punto de entrada principal
│       ├── 📄 state.js        # Gestión de estado
│       ├── 📄 api.js          # Integración con APIs
│       └── 📁 components/
│           ├── 📄 Sidebar.js     # Componente de barra lateral
│           ├── 📄 ChatWindow.js  # Componente de ventana de chat
│           └── 📄 Modal.js       # Componente de modales
└── 📁 api/
    └── 📄 chat.js             # Integración con OpenRouter
```

## 🚀 Instalación y Uso

### Prerrequisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Clave API de OpenRouter ([obtener aquí](https://openrouter.ai/))

### Configuración Local

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/hyperfocus-AI.git
   cd hyperfocus-AI
   ```

2. **Inicia el servidor local**
   ```bash
   python -m http.server 8000
   ```

3. **Abre la aplicación**
   - Navega a `http://localhost:8000`
   - Configura tu API key de OpenRouter en la aplicación

### Configuración de API

1. Obtén tu clave API de [OpenRouter](https://openrouter.ai/)
2. En la aplicación, ve a configuración
3. Ingresa tu API key
4. ¡Comienza a chatear con IA!

## 🎨 Guía de Estilo

### Colores del Sistema
- **Primario**: `#38ef7d` (Verde vibrante)
- **Secundario**: `#0066ff` (Azul)
- **Fondo**: `#1a1a1a` (Gris oscuro)
- **Texto**: `#ffffff` / `#b0b0b0`

### Tipografía
- **Fuente Principal**: System fonts (San Francisco, Segoe UI, Roboto)
- **Tamaño Base**: 16px
- **Sidebar**: 0.9rem para mayor densidad

### Componentes
- **Bordes**: 8px border-radius para suavidad
- **Sombras**: Sutiles para profundidad
- **Animaciones**: Transiciones de 0.2s para fluidez

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🙏 Agradecimientos

- [OpenRouter](https://openrouter.ai/) por proporcionar acceso a modelos de IA
- La comunidad de desarrolladores por las herramientas y librerías utilizadas

---

**Desarrollado con ❤️ para estudiantes que buscan maximizar su potencial de aprendizaje**
