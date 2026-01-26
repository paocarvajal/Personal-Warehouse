# ESPECIFICACIONES TÉCNICAS - ESTILO MINIMALISTA SUAVE
## App Finanzas Casa Toh - Guía para Antigravity

---

## 📋 RESUMEN EJECUTIVO

Esta es la especificación completa del diseño responsivo para la aplicación financiera de Casa Toh usando el **Estilo 1: Minimalista Suave**.

**Compatibilidad:**
- ✅ Móvil (320px - 767px)
- ✅ Tablet (768px - 1023px)  
- ✅ Desktop (1024px+)

---

## 🎨 PALETA DE COLORES

### Fondos
```css
--bg-primary: #1A1D29       /* Fondo principal azul oscuro profundo */
--bg-secondary: #242938     /* Cards y elementos secundarios */
--bg-tertiary: #2d3241      /* Hover states */
```

### Acentos
```css
--accent-purple: #6C63FF    /* Acento principal morado */
--accent-purple-light: rgba(108, 99, 255, 0.15)  /* Fondo morado */
--accent-teal: #4ECDC4      /* Acento secundario turquesa */
--accent-teal-light: rgba(78, 205, 196, 0.12)    /* Fondo turquesa */
```

### Alertas
```css
--color-success: #4ECDC4    /* Verde/turquesa para ingresos */
--color-success-bg: rgba(78, 205, 196, 0.12)
--color-error: #FF6B6B      /* Rojo para gastos */
--color-error-bg: rgba(255, 107, 107, 0.12)
```

### Textos
```css
--text-primary: #E8E9ED     /* Texto principal blanco cálido */
--text-secondary: #9BA3B4   /* Texto secundario gris suave */
```

### Sombras
```css
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.1)
--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.15)
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.2)
--shadow-hover: 0 8px 20px rgba(108, 99, 255, 0.15)
```

---

## 📐 ESPACIADO Y DIMENSIONES

### Sistema de Espaciado
```css
--spacing-xs: 8px
--spacing-sm: 12px
--spacing-md: 16px
--spacing-lg: 24px
--spacing-xl: 32px
```

### Bordes Redondeados
```css
--radius-sm: 12px
--radius-md: 16px
--radius-lg: 20px
--radius-xl: 24px
```

---

## 📱 BREAKPOINTS RESPONSIVOS

### Móvil
```css
@media (max-width: 767px) {
    /* Una columna */
    /* Navegación inferior fija */
    /* Padding reducido */
}
```

### Tablet
```css
@media (min-width: 768px) and (max-width: 1023px) {
    /* Grid de 2 columnas opcional */
    /* Navegación inferior visible */
    /* Mayor espaciado */
}
```

### Desktop
```css
@media (min-width: 1024px) {
    /* Sidebar fijo lateral */
    /* Grid complejo posible */
    /* Sin navegación inferior */
    /* Máximo espaciado */
}
```

---

## 🏗️ ESTRUCTURA DE LAYOUT

### MÓVIL (< 768px)
```
┌─────────────────────┐
│   Header            │
├─────────────────────┤
│   Balance Card      │
├─────────────────────┤
│   Quick Actions     │
│   [2x2 Grid]        │
├─────────────────────┤
│   Transactions      │
│   [Lista vertical]  │
│                     │
│                     │
└─────────────────────┘
│  Bottom Nav (fijo)  │
└─────────────────────┘
```

### TABLET (768px - 1023px)
```
┌──────────────────────────┐
│   Header                 │
├──────────────────────────┤
│   Balance Card           │
├──────────────────────────┤
│   Quick Actions          │
│   [4x1 Grid]            │
├──────────────────────────┤
│   Transactions           │
│   [Lista vertical]       │
│                          │
└──────────────────────────┘
│  Bottom Nav (fijo)       │
└──────────────────────────┘
```

### DESKTOP (> 1024px)
```
┌──────┬────────────────────────┐
│      │   Header               │
│ Side ├────────────────────────┤
│ bar  │   Balance Card         │
│      ├────────────────────────┤
│ Nav  │   Quick Actions        │
│      │   [6x1 Grid]          │
│      ├────────────────────────┤
│      │   Transactions         │
│      │   [Lista vertical]     │
│      │                        │
└──────┴────────────────────────┘
```

---

## 🔧 COMPONENTES PRINCIPALES

### 1. Balance Card
**Responsividad:**
- Móvil: padding 24px, font-size 36px
- Tablet: padding 32px, font-size 44px
- Desktop: padding 32px, font-size 52px

**Comportamiento:**
- Hover: translateY(-2px) + shadow aumentada
- Transición suave 0.3s

### 2. Quick Actions Grid
**Responsividad:**
- Móvil: 2 columnas (2x2)
- Tablet: 4 columnas (4x1)
- Desktop: 6 columnas (6x1, max-width 800px)

**Comportamiento:**
- Hover en botón: translateY(-4px) + shadow morada
- Hover en icono: scale(1.1)

### 3. Transaction Items
**Responsividad:**
- Móvil: padding 16px, iconos 44px
- Tablet: padding 20px, iconos 50px
- Desktop: padding 20px, iconos 50px

**Comportamiento:**
- Hover: translateX(4px) + background change
- Truncate text con ellipsis si es muy largo

### 4. Navegación
**Móvil/Tablet:**
- Bottom nav fijo (fixed, bottom: 0)
- 4 items principales
- z-index: 1000

**Desktop:**
- Sidebar fijo lateral (fixed, left: 0)
- Width: 280px
- Lista vertical de navegación

---

## 🎯 GUÍA DE IMPLEMENTACIÓN PARA ANTIGRAVITY

### PASO 1: Configurar Variables CSS
Copiar todo el bloque `:root {}` con las variables CSS en tu proyecto.

### PASO 2: Estructura HTML Base
```html
<div class="app-container">
    <header class="header">...</header>
    <div class="balance-card">...</div>
    <div class="quick-actions">...</div>
    <div class="transactions-list">...</div>
</div>
<nav class="bottom-nav">...</nav>
<aside class="sidebar">...</aside>
```

### PASO 3: Media Queries Críticas
Asegurar que las 3 media queries principales estén implementadas:
1. `@media (max-width: 767px)` - Móvil
2. `@media (min-width: 768px) and (max-width: 1023px)` - Tablet
3. `@media (min-width: 1024px)` - Desktop

### PASO 4: Tipografía
```css
font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'SF Pro Display', 'Segoe UI', 'Roboto', sans-serif;
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
```

### PASO 5: Interactividad
- Todos los botones: cursor pointer + transición
- Hover states en cards y botones
- Active states para navegación
- Tap highlight color transparent para móvil

---

## 🔍 DETALLES TÉCNICOS IMPORTANTES

### Grid System
```css
/* Quick Actions */
display: grid;
grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
gap: 16px;

/* Mobile override */
@media (max-width: 479px) {
    grid-template-columns: repeat(2, 1fr);
}
```

### Flexbox para Transacciones
```css
.transaction-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.transaction-left {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;
    min-width: 0; /* Permite text-overflow */
}
```

### Text Overflow
```css
.transaction-name, .transaction-category {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
```

### Fixed Navigation
```css
.bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1000;
}

/* Compensar espacio */
.app-container {
    padding-bottom: 100px; /* En móvil */
}
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [ ] Variables CSS configuradas
- [ ] Paleta de colores aplicada
- [ ] Sistema de espaciado implementado
- [ ] Breakpoints responsivos funcionando
- [ ] Layout móvil (una columna + bottom nav)
- [ ] Layout tablet (optimizado)
- [ ] Layout desktop (sidebar + grid)
- [ ] Balance card responsivo
- [ ] Quick actions grid responsivo
- [ ] Transacciones con hover effects
- [ ] Navegación bottom (móvil/tablet)
- [ ] Navegación sidebar (desktop)
- [ ] Tipografía correcta
- [ ] Sombras y efectos
- [ ] Transiciones suaves
- [ ] Text overflow handling
- [ ] Touch targets mínimo 44x44px

---

## 🚀 COMANDOS RÁPIDOS PARA ANTIGRAVITY

Si Antigravity soporta comandos directos:

```bash
# Aplicar estilo base
apply-theme minimalista-suave

# Configurar breakpoints
set-breakpoints mobile:767 tablet:1023 desktop:1024

# Aplicar grid system
set-grid quick-actions columns:auto-fit min:80px gap:16px

# Configurar navegación
nav-bottom mobile tablet
nav-sidebar desktop
```

---

## 📞 SOPORTE

Si algo no funciona correctamente:
1. Verificar que las variables CSS estén definidas
2. Confirmar que los breakpoints se aplican correctamente
3. Validar que el z-index de navegación sea 1000
4. Asegurar que padding-bottom compensa el nav fijo

---

## 🎨 PERSONALIZACIÓN FUTURA

Para cambiar colores fácilmente, solo modifica las variables en `:root`:

```css
:root {
    --accent-purple: #TU_COLOR;  /* Cambia el morado */
    --accent-teal: #TU_COLOR;    /* Cambia el turquesa */
}
```

Todo el sistema se actualizará automáticamente.
