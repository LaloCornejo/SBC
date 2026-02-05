# Aprender++ Frontend

Sistema inteligente de aprendizaje de programación - Frontend en React.

## Características

- **Interfaz minimalista tipo app**: Diseño moderno y limpio inspirado en aplicaciones móviles
- **Navegación intuitiva**: 4 secciones principales:
  - **Inicio**: Página de bienvenida con información del proyecto
  - **Aprender**: Interfaz de lecciones interactivas con editor de código
  - **Acerca de**: Información del equipo y del proyecto
  - **Perfil**: Estadísticas de progreso y logros del usuario

## Equipo

- Hernández Franco Brandom Galder
- Manzanilla Hornung Mauricio Daniel
- Orta Escobar Felipe de Jesús
- Cornejo Clavel Jesús Eduardo

**Institución**: UAEH - Universidad Autónoma del Estado de Hidalgo  
**Instituto**: ICBI - Instituto de Ciencias Básicas e Ingeniería  
**Semestre**: 6to Grupo 1

## Tecnologías

- React 18
- TypeScript
- Vite
- React Router DOM
- Axios
- Lucide React (iconos)

## Instalación

```bash
# Instalar dependencias
bun install

# Iniciar servidor de desarrollo
bun run dev

# Construir para producción
bun run build
```

## Estructura del Proyecto

```
src/
├── components/     # Componentes reutilizables (Navbar, Footer)
├── pages/         # Páginas de la aplicación
├── services/      # Servicios de API
├── hooks/         # Custom hooks
├── types/         # TypeScript types
├── styles/        # Estilos globales
├── App.tsx        # Componente principal
└── main.tsx       # Punto de entrada
```

## Scripts

- `bun run dev` - Inicia el servidor de desarrollo
- `bun run build` - Construye la aplicación para producción
- `bun run preview` - Previsualiza la build de producción
- `bun run lint` - Ejecuta el linter
