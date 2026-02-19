# Sistema de Gestión de Cobros y Servicios Web - Lista de Tareas

## Base de Datos y Backend
- [x] Diseñar esquema de base de datos (clientes, servicios, pagos, facturas)
- [x] Implementar API tRPC para gestión de clientes (crear, editar, eliminar, listar)
- [x] Implementar API tRPC para gestión de servicios por cliente
- [x] Implementar API tRPC para gestión de pagos y estados
- [x] Implementar lógica de unificación de cobros por cliente
- [x] Implementar sistema de alertas automáticas (7 días antes de vencimiento)
- [x] Implementar generación de facturas PDF con almacenamiento en S3

## Frontend - Dashboard y Navegación
- [x] Configurar tema elegante y minimalista con glassmorphism
- [x] Implementar DashboardLayout con navegación lateral
- [x] Crear dashboard principal con resumen de clientes activos
- [x] Mostrar próximos pagos en dashboard
- [ ] Implementar gráficos de resumen de cobros mensuales

## Frontend - Gestión de Clientes
- [x] Crear página de lista de clientes con búsqueda y filtros
- [x] Implementar formulario para agregar nuevo cliente
- [ ] Implementar formulario para editar cliente existente
- [x] Implementar eliminación de clientes con confirmación
- [x] Mostrar información detallada de contacto por cliente

## Frontend - Gestión de Servicios
- [x] Crear vista de servicios por cliente (hosting, dominios, correos)
- [x] Implementar formulario para agregar servicio a cliente
- [ ] Implementar edición de servicios (plataforma, fecha renovación, monto)
- [x] Mostrar unificación de cobros cuando cliente tiene múltiples servicios
- [x] Implementar eliminación de servicios

## Frontend - Calendario y Pagos
- [x] Crear calendario visual mensual de pagos
- [x] Implementar filtros por cliente y tipo de servicio en calendario
- [x] Mostrar indicadores de color (pendiente, pagado, vencido)
- [x] Crear historial de pagos con estados
- [x] Implementar registro de nuevo pago
- [x] Implementar búsqueda por nombre, servicio o fecha de renovación

## Frontend - Reportes y Exportación
- [x] Implementar exportación de cobros pendientes a CSV
- [x] Implementar exportación de cobros completados a CSV
- [x] Crear vista de facturas generadas
- [x] Implementar descarga de facturas PDF desde S3

## Testing y Calidad
- [ ] Escribir tests para API de clientes
- [ ] Escribir tests para API de servicios
- [ ] Escribir tests para API de pagos
- [ ] Escribir tests para generación de facturas
- [ ] Verificar responsividad en móviles y tablets
- [ ] Verificar flujo completo de usuario

## Documentación
- [ ] Documentar estructura de base de datos
- [ ] Documentar endpoints de API
- [ ] Crear guía de usuario básica

## Bugs Reportados
- [x] Corregir error de API que devuelve HTML en lugar de JSON (TRPCClientError)
- [ ] Corregir error persistente en /payments que devuelve HTML en lugar de JSON
