# ERP 3D Studio

Sistema de gestión empresarial (ERP) especializado para estudios de impresión 3D, construido con Next.js 15 y Supabase.

## 📋 Descripción

ERP 3D Studio es una solución completa para la gestión de operaciones en estudios de impresión 3D, que incluye:

- **Gestión de Inventario**: Control de materiales (filamentos, resinas) con seguimiento de stock y alertas
- **Gestión de Productos**: Catálogo de productos imprimibles con costos y tiempos de producción
- **Cotizaciones**: Generación de presupuestos con cálculo automático de costos
- **Ventas**: Registro y seguimiento de órdenes de venta
- **Finanzas**: Control de ingresos, gastos y flujo de caja
- **Reportes**: Análisis y visualización de datos del negocio
- **Dashboard**: Panel de control con métricas clave en tiempo real

## 🚀 Tecnologías

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **UI**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Componentes**: [Radix UI](https://www.radix-ui.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
- **Base de Datos**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Validación**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Iconos**: [Lucide React](https://lucide.dev/)
- **Gestión de paquetes**: pnpm

## 📦 Requisitos Previos

- Node.js 18.x o superior
- pnpm (recomendado) o npm
- Cuenta de Supabase

## 🛠️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd erp-3d-studio
   ```

2. **Instalar dependencias**
   ```bash
   pnpm install
   ```

3. **Configurar variables de entorno**
   
   Crear un archivo `.env.local` en la raíz del proyecto:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
   ```

4. **Configurar Supabase**
   
   Ejecutar el script de configuración de base de datos en el SQL Editor de Supabase:
   ```bash
   # El contenido está en supabase-setup.sql
   ```
   
   Ver `SUPABASE_SETUP_INSTRUCTIONS.md` para instrucciones detalladas.

5. **Ejecutar en desarrollo**
   ```bash
   pnpm dev
   ```

   La aplicación estará disponible en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
erp-3d-studio/
├── app/                      # App Router de Next.js
│   ├── layout.tsx           # Layout principal
│   ├── page.tsx             # Página de inicio
│   ├── globals.css          # Estilos globales
│   └── login/               # Página de login
├── components/              # Componentes React
│   ├── auth/               # Componentes de autenticación
│   ├── sections/           # Secciones principales (Dashboard, Ventas, etc.)
│   └── ui/                 # Componentes UI reutilizables (shadcn)
├── lib/                    # Utilidades y configuración
│   ├── supabase/          # Cliente y hooks de Supabase
│   └── utils.ts           # Funciones auxiliares
├── hooks/                  # Custom React hooks
├── public/                # Archivos estáticos
└── styles/               # Estilos adicionales
```

## 🗄️ Esquema de Base de Datos

El sistema utiliza las siguientes tablas principales:

- **users**: Usuarios del sistema con roles y permisos
- **materials**: Inventario de materiales (filamentos, resinas)
- **products**: Catálogo de productos imprimibles
- **quotations**: Cotizaciones y presupuestos
- **sales**: Órdenes de venta
- **finance_entries**: Registros financieros (ingresos/gastos)
- **material_movements**: Movimientos de inventario
- **production_costs**: Costos de producción por producto

Ver `database-schema.md` para el esquema completo y relaciones.

## 🔐 Autenticación y Seguridad

- Autenticación mediante Supabase Auth
- Row Level Security (RLS) implementado en todas las tablas
- Roles de usuario: `admin`, `user`, `viewer`
- Rutas protegidas con componente `ProtectedRoute`

## 📝 Scripts Disponibles

```bash
# Desarrollo
pnpm dev          # Inicia el servidor de desarrollo

# Producción
pnpm build        # Construye la aplicación para producción
pnpm start        # Inicia el servidor de producción

# Calidad de código
pnpm lint         # Ejecuta ESLint
```

## 🚢 Despliegue

### Vercel (Recomendado)

1. Conectar el repositorio a Vercel
2. Configurar las variables de entorno
3. Desplegar automáticamente con cada push a main

Ver `IMPLEMENTATION_GUIDE.md` para más detalles sobre el proceso de despliegue.

## 📚 Documentación Adicional

- `IMPLEMENTATION_GUIDE.md` - Guía completa de implementación
- `SUPABASE_SETUP_INSTRUCTIONS.md` - Configuración de Supabase paso a paso
- `database-schema.md` - Documentación del esquema de base de datos
- `DATABASE_DIAGRAM.md` - Diagrama de la base de datos
- `TESTING_PLAN.md` - Plan de pruebas
- `MIGRATION_SUMMARY.md` - Resumen de la migración a Supabase

## 🔧 Solución de Problemas

Ver los archivos de documentación:
- `FIX_FAILED_TO_FETCH.md` - Solución a errores de conexión
- `FIXES_APPLIED.md` - Registro de correcciones aplicadas

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y propietario.

## 👨‍💻 Autor

Desarrollado por martodev

---

**Nota**: Este proyecto está en desarrollo activo. Consulta la documentación técnica en la carpeta raíz para más detalles sobre la implementación y configuración.
