# Railway Setup - Sin OAuth

Esta versión está modificada para funcionar en Railway sin depender del OAuth de Manus.

## Variables de Entorno Requeridas

Configura estas variables en Railway (servicio web):

```bash
# Base de datos (referencia automática de MySQL)
DATABASE_URL=${{MySQL.MYSQL_URL}}

# Seguridad
JWT_SECRET=<genera-un-string-aleatorio-seguro>
NODE_ENV=production

# Puerto
PORT=3000

# Información del propietario (opcional)
OWNER_NAME=Tu Nombre
VITE_APP_TITLE=Sistema de Gestión de Cobros
```

## Generar JWT_SECRET

En tu terminal local:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Ejecutar Migraciones

Después del primer despliegue, cambia temporalmente el comando de inicio a:
```
pnpm db:push && pnpm start
```

Luego vuelve a:
```
pnpm start
```

## Funcionalidades Disponibles

✅ **Sin autenticación requerida** - Acceso directo a todas las funcionalidades
✅ Gestión de clientes
✅ Gestión de servicios
✅ Registro de pagos
✅ Calendario de renovaciones
✅ Historial y exportación CSV
✅ Dashboard con métricas

⚠️ **Nota de seguridad**: Esta versión no tiene autenticación. Considera agregar un sistema de login simple si necesitas proteger el acceso.

## Agregar Autenticación Básica (Opcional)

Si necesitas proteger el acceso, puedes:
1. Usar HTTP Basic Auth de Railway
2. Implementar un login simple con usuario/contraseña
3. Usar un servicio de autenticación externo (Auth0, Firebase Auth, etc.)

## Soporte

Para problemas con el despliegue: https://railway.app/help
