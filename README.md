<div align="center">

# Creativa Studios

**Dashboard administrativo moderno para gestión de servicios, inventario y clientes.**

![React](https://img.shields.io/badge/React-19.2.5-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=flat-square&logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.2-06B6D4?style=flat-square&logo=tailwindcss)

</div>

---

## 📋 Descripción

**Creativa Studios** es una aplicación web moderna construida con React y TypeScript. Proporciona un dashboard administrativo completo con secciones de home, autenticación, gestión de clientes, inventario, costos y pedidos.

---

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <tu-repo-url>
cd creativa-studios
```

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Levantar servidor de desarrollo

```bash
pnpm dev
```

La aplicación estará disponible en **`http://localhost:5173`** (Vite usa 5173 por defecto).

---

## 📝 Scripts Disponibles

| Comando        | Descripción                                      |
| -------------- | ------------------------------------------------ |
| `pnpm dev`     | Levanta servidor de desarrollo con HMR           |
| `pnpm build`   | Compila TypeScript y genera bundle de producción |
| `pnpm lint`    | Ejecuta ESLint en todo el código                 |
| `pnpm format`  | Formatea código con Prettier                     |
| `pnpm preview` | Previsualiza build de producción localmente      |

---

## 📁 Estructura del Proyecto

```
src/
├── app.router.tsx           # Configuración de rutas principales
├── CreativaStudios.tsx      # Componente raíz de la app
├── main.tsx                 # Entry point
├── index.css                # Estilos globales
│
├── admin/                   # Feature: Panel administrativo
│   ├── components/          # Componentes específicos (SideBar, TopBar)
│   ├── layouts/             # AdminLayout
│   └── pages/               # Dashboard, Clientes, Inventario, etc.
│
├── auth/                    # Feature: Autenticación
│   ├── layouts/             # AuthLayout
│   └── pages/               # LoginPage
│
├── home/                    # Feature: Página principal
│   ├── components/          # Hero, Header, Footer, Secciones, etc.
│   ├── layouts/             # HomeLayout
│   ├── pages/               # HomePage
│   └── mocks/               # Datos de ejemplo
│
├── components/
│   ├── custom/              # Componentes personalizados (Logo, Icons)
│   ├── ui/                  # Componentes base de shadcn/ui
│   └── shared/              # Componentes compartidos globales
│
├── hooks/                   # Custom hooks (use-mobile, etc.)
├── lib/
│   ├── utils.ts             # Funciones utilitarias
│   └── constants/           # Constantes globales
│
└── interfaces/              # Tipos TypeScript compartidos
```

**Arquitectura:** Feature-first con co-location de código relacionado.

---

## 🎯 Páginas Principales

| Ruta                | Descripción                |
| ------------------- | -------------------------- |
| `/`                 | Página principal (landing) |
| `/login`            | Autenticación              |
| `/admin/dashboard`  | Dashboard administrativo   |
| `/admin/clientes`   | Gestión de clientes        |
| `/admin/inventario` | Gestión de inventario      |
| `/admin/costos`     | Análisis de costos         |
| `/admin/pedidos`    | Gestión de pedidos         |

---
