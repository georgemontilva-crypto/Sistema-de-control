# Sistema de Gestión de Cobros y Servicios Web

Plataforma moderna y elegante para gestionar clientes, servicios de hosting/dominios/correos, y control de pagos y renovaciones.

![Dashboard](https://img.shields.io/badge/Stack-React%2019%20%7C%20TypeScript%20%7C%20tRPC%20%7C%20MySQL-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 🚀 Características

### Gestión de Clientes
- ✅ Agregar, editar y eliminar clientes
- ✅ Búsqueda y filtrado avanzado
- ✅ Información de contacto completa
- ✅ Historial de servicios por cliente

### Gestión de Servicios
- ✅ Múltiples tipos: Hosting, Dominios, Correos, SSL, Mantenimiento
- ✅ Seguimiento de plataformas y proveedores
- ✅ Fechas de inicio y renovación
- ✅ Ciclos de facturación (mensual, anual)
- ✅ Estados: Activo, Suspendido, Cancelado

### Control de Pagos
- ✅ Registro de pagos con múltiples métodos
- ✅ Estados: Pendiente, Pagado, Vencido
- ✅ Historial completo con filtros
- ✅ Exportación a CSV
- ✅ Referencias y notas

### Dashboard y Reportes
- ✅ Resumen ejecutivo con métricas clave
- ✅ Próximas renovaciones (30 días)
- ✅ Pagos pendientes y vencidos
- ✅ Calendario visual mensual
- ✅ Alertas automáticas 7 días antes

### Facturación
- ✅ Generación de facturas profesionales en PDF
- ✅ Almacenamiento en S3
- ✅ Detalles de servicios y montos
- ✅ Logo y personalización

## 🛠️ Stack Tecnológico

- **Frontend**: React 19, TypeScript, Tailwind CSS 4, shadcn/ui
- **Backend**: Express 4, tRPC 11
- **Base de Datos**: MySQL (Drizzle ORM)
- **Autenticación**: OAuth (Manus) / Adaptable
- **Almacenamiento**: AWS S3
- **Diseño**: Glassmorphism, Dark Theme

## 📦 Instalación Local

```bash
# Clonar repositorio
git clone https://github.com/georgemontilva-crypto/Sistema-de-control.git
cd Sistema-de-control

# Instalar dependencias
pnpm install

# Configurar variables de entorno
# Copia y edita las variables necesarias

# Ejecutar migraciones
pnpm db:push

# Iniciar servidor de desarrollo
pnpm dev
```

## 🚢 Despliegue

### Opción 1: Railway (Recomendado)
Ver guía completa en [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)

### Opción 2: Manus Hosting
1. Importa el proyecto en Manus
2. Haz clic en "Publish"
3. ¡Listo! Incluye base de datos y dominio

## 📁 Estructura del Proyecto

```
├── client/              # Frontend React
│   ├── src/
│   │   ├── pages/      # Páginas de la aplicación
│   │   ├── components/ # Componentes reutilizables
│   │   └── lib/        # Utilidades y configuración
├── server/             # Backend tRPC
│   ├── routers.ts      # Definición de rutas API
│   ├── db.ts           # Funciones de base de datos
│   └── _core/          # Configuración del servidor
├── drizzle/            # Esquemas y migraciones
└── shared/             # Tipos y constantes compartidas
```

## 🔧 Scripts Disponibles

```bash
pnpm dev          # Servidor de desarrollo
pnpm build        # Compilar para producción
pnpm start        # Iniciar en producción
pnpm db:push      # Ejecutar migraciones de BD
pnpm test         # Ejecutar tests
pnpm check        # Verificar tipos TypeScript
```

## 🎨 Diseño

El sistema utiliza un diseño elegante con:
- **Glassmorphism**: Efectos de vidrio translúcido
- **Dark Theme**: Tema oscuro profesional
- **Responsive**: Totalmente adaptable a móviles
- **Iconografía**: Lucide React icons

## 📊 Base de Datos

Esquema principal:
- `users` - Usuarios del sistema
- `clients` - Clientes y sus datos
- `services` - Servicios contratados
- `payments` - Registro de pagos
- `invoices` - Facturas generadas
- `alerts` - Sistema de alertas

## 🔐 Seguridad

- Autenticación OAuth
- JWT para sesiones
- Validación con Zod
- Prepared statements (SQL injection protection)
- HTTPS obligatorio en producción

## 📝 Licencia

MIT License - Ver [LICENSE](./LICENSE) para más detalles

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📧 Contacto

Para soporte o consultas: [Crear un issue](https://github.com/georgemontilva-crypto/Sistema-de-control/issues)

---

Desarrollado con ❤️ para simplificar la gestión de servicios web
