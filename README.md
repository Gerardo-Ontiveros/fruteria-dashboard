 # Practica – DASHBOARD DE FRUTERÍA (Exenta examen)

## Para empezar

### Prerequisitos
- Node: v24.11
- PNPM (v10.23)
    ```sh
        npm install -g pnpm
    ```
## Instalación
1. Clona el repositorio
    ```sh
    git clone git@github.com:Gerardo-Ontiveros/fruteria-dashboard.git
    ```

2. Instala los paquetes de PNPM
    ```sh
    pnpm install
    ```

3. Ejecutar el proyecto
    - Para ejutar el servidor debes abrir una terminal
    ```sh
    pnpm run server
    ```
    - Para ejecutar el cliente debes abrir una terminal
    ```sh
    pnpm run dev


## ⚙️ Tecnologías obligatorias
- React + Vite + TypeScript [✅]
- Ant Design v5.29.2 (https://5x.ant.design/components/overview) [✅]
- Base de datos (JSON Server o backend simple) [✅]

## 🎯 Objetivo
Desarrollar un dashboard web para la gestión de productos de una frutería, controlando inventario, entradas, salidas y caducidad, aplicando usabilidad y accesibilidad.

## 🖥 Vistas obligatorias
- Dashboard: stock total, productos por caducar, entradas y salidas recientes [✅]
- Gestión de productos: listado (mín. 15), alta, edición y eliminación [✅]
- Caducidad: productos vigentes, por caducar y caducados (indicadores visuales) [✅]
- Entradas: registro y actualización automática del stock [✅]
- Salidas: registro y validación para evitar stock negativo [✅]

## 🗄 Base de datos
- CRUD de productos
- Registro de entradas y salidas
- Control de stock y caducidad

## ♿ Accesibilidad
- Labels y validaciones correctas
- Buen contraste
- Navegación por teclado y scroll
- Mensajes claros (éxito, error, advertencia)

## 👤 Usabilidad
- Menú claro
- Flujo sencillo
- Información fácil de identificar