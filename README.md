# Personal Warehouse

Sistema de gestión de inventario personal con enfoque minimalista y capacidades de sincronización en la nube.

## Características

- 📦Gestión de Inventario (Altas, Bajas, Edición)
- 🏷️ Organización por Cajas y Categorías
- 🔍 Búsqueda rápida y Escáner de Códigos QR
- ☁️ Sincronización en tiempo real con **Firebase**
- 📊 Dashboard con estadísticas y **Benchmarking** (Comparador de precios)
- 🎨 Diseño "Warm & Cozy" (Modo Oscuro)

## Tecnologías

- React + Vite
- TypeScript
- Tailwind CSS (Variables CSS personalizadas)
- Firebase (Firestore & Analytics)
- React Router DOM
- Lucide React (Iconos)

## Configuración

1.  Clonar el repositorio.
2.  Instalar dependencias:
    ```bash
    npm install
    ```
3.  Crear un proyecto en Firebase y configurar las credenciales en `src/firebase.ts`.
4.  Ejecutar localmente:
    ```bash
    npm run dev
    ```

## Despliegue

La aplicación está lista para desplegarse en **Vercel**, **Netlify** o **Firebase Hosting**.

### Build para producción
```bash
npm run build
```
Los archivos generados estarán en la carpeta `dist`.
