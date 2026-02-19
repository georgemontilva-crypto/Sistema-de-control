# Guía de Despliegue en Railway

## Requisitos Previos

- Cuenta en [Railway.app](https://railway.app)
- Repositorio GitHub: https://github.com/georgemontilva-crypto/Sistema-de-control

## Paso 1: Crear Proyecto en Railway

1. Ve a [Railway.app](https://railway.app) e inicia sesión
2. Haz clic en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Busca y selecciona el repositorio **"Sistema-de-control"**

## Paso 2: Agregar Base de Datos MySQL

1. En tu proyecto de Railway, haz clic en **"+ New"**
2. Selecciona **"Database"** → **"Add MySQL"**
3. Railway creará automáticamente una base de datos MySQL
4. Copia la variable `DATABASE_URL` que se genera automáticamente

## Paso 3: Configurar Variables de Entorno

En la configuración de tu servicio web en Railway, agrega estas variables:

### Variables Obligatorias:

```
DATABASE_URL=<copiada automáticamente de MySQL>
JWT_SECRET=<genera un string aleatorio seguro>
NODE_ENV=production
PORT=3000
```

### Generar JWT_SECRET:
Puedes generar un JWT_SECRET seguro con este comando en tu terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Variables Opcionales (para funcionalidades avanzadas):

```
OWNER_NAME=Tu Nombre
VITE_APP_TITLE=Sistema de Gestión de Cobros
```

**Nota:** Las funcionalidades de OAuth de Manus y generación de facturas PDF con S3 no estarán disponibles en Railway sin configuración adicional. El sistema funcionará para gestión de clientes, servicios y pagos.

## Paso 4: Desplegar

1. Railway detectará automáticamente que es un proyecto Node.js
2. Instalará dependencias con `pnpm install`
3. Ejecutará `pnpm build` para compilar
4. Iniciará el servidor con `pnpm start`

## Paso 5: Ejecutar Migraciones de Base de Datos

Después del primer despliegue:

1. Ve a la pestaña de tu servicio web en Railway
2. Haz clic en **"Settings"** → **"Deploy"**
3. En **"Custom Start Command"**, temporalmente cambia a:
   ```
   pnpm db:push && pnpm start
   ```
4. Guarda y espera a que se redespliegue
5. Una vez completado, puedes volver al comando original: `pnpm start`

## Paso 6: Acceder a tu Aplicación

1. Railway te proporcionará una URL pública automáticamente
2. Puedes configurar un dominio personalizado en **Settings → Domains**

## Funcionalidades Disponibles en Railway

✅ **Disponibles:**
- Gestión completa de clientes
- Gestión de servicios (hosting, dominios, correos)
- Registro y seguimiento de pagos
- Calendario de renovaciones
- Historial de pagos con filtros
- Exportación de datos a CSV
- Dashboard con resumen ejecutivo

⚠️ **Requieren configuración adicional:**
- Autenticación OAuth de Manus (necesitarás implementar auth alternativo)
- Generación de facturas PDF con almacenamiento S3 (necesitarás configurar AWS S3)
- Sistema de alertas por email (necesitarás configurar servicio de email)

## Solución de Problemas

### Error de conexión a base de datos
- Verifica que `DATABASE_URL` esté correctamente configurada
- Asegúrate de haber ejecutado las migraciones (`pnpm db:push`)

### Error 500 en producción
- Revisa los logs en Railway: **Deployments → View Logs**
- Verifica que todas las variables de entorno estén configuradas

### La aplicación no inicia
- Verifica que `PORT` esté configurado correctamente
- Revisa que `NODE_ENV=production`

## Migración de Datos desde Manus

Si tienes datos en Manus que quieres migrar:

1. Accede a la base de datos de Manus desde **Settings → Database**
2. Exporta los datos usando MySQL Workbench o `mysqldump`
3. Importa los datos a tu base de datos de Railway

## Costos Estimados en Railway

- **Plan Hobby**: $5/mes (incluye $5 de crédito)
- **Base de datos MySQL**: ~$5/mes
- **Total aproximado**: $10/mes

## Soporte

Para problemas con Railway: https://railway.app/help
Para el código del proyecto: https://github.com/georgemontilva-crypto/Sistema-de-control/issues
