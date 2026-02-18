import * as db from "./db";
import { notifyOwner } from "./_core/notification";

/**
 * Generate alerts for upcoming service renewals
 * This should be called periodically (e.g., daily via cron job)
 */
export async function generateRenewalAlerts() {
  const services = await db.getUpcomingRenewals(30);
  const now = new Date();
  const alerts: Array<{ type: string; service: any; daysUntil: number }> = [];

  for (const service of services) {
    const renewalDate = new Date(service.renewalDate);
    const daysUntil = Math.ceil((renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Generate alert for 7 days before
    if (daysUntil === 7) {
      const client = await db.getClientById(service.clientId);
      if (client) {
        await db.createAlert({
          clientId: service.clientId,
          serviceId: service.id,
          alertType: "vencimiento_7d",
          alertDate: now,
          message: `El servicio "${service.serviceName}" de ${client.name} vence en 7 días (${renewalDate.toLocaleDateString("es-ES")})`,
        });
        alerts.push({ type: "7 días", service, daysUntil });
      }
    }

    // Generate alert for 3 days before
    if (daysUntil === 3) {
      const client = await db.getClientById(service.clientId);
      if (client) {
        await db.createAlert({
          clientId: service.clientId,
          serviceId: service.id,
          alertType: "vencimiento_3d",
          alertDate: now,
          message: `El servicio "${service.serviceName}" de ${client.name} vence en 3 días (${renewalDate.toLocaleDateString("es-ES")})`,
        });
        alerts.push({ type: "3 días", service, daysUntil });
      }
    }

    // Generate alert for today
    if (daysUntil === 0) {
      const client = await db.getClientById(service.clientId);
      if (client) {
        await db.createAlert({
          clientId: service.clientId,
          serviceId: service.id,
          alertType: "vencimiento_hoy",
          alertDate: now,
          message: `El servicio "${service.serviceName}" de ${client.name} vence HOY (${renewalDate.toLocaleDateString("es-ES")})`,
        });
        alerts.push({ type: "hoy", service, daysUntil });
      }
    }

    // Check for overdue services
    if (daysUntil < 0) {
      const client = await db.getClientById(service.clientId);
      if (client) {
        await db.createAlert({
          clientId: service.clientId,
          serviceId: service.id,
          alertType: "pago_vencido",
          alertDate: now,
          message: `El servicio "${service.serviceName}" de ${client.name} está VENCIDO desde hace ${Math.abs(daysUntil)} días`,
        });
        alerts.push({ type: "vencido", service, daysUntil });
      }
    }
  }

  return alerts;
}

/**
 * Send pending alerts to owner
 */
export async function sendPendingAlerts() {
  const pendingAlerts = await db.getPendingAlerts();
  
  for (const alert of pendingAlerts) {
    const success = await notifyOwner({
      title: `Alerta: ${alert.alertType.replace("_", " ")}`,
      content: alert.message,
    });

    if (success) {
      await db.markAlertAsSent(alert.id);
    }
  }

  return pendingAlerts.length;
}

/**
 * Main alert processing function
 * Generates new alerts and sends pending ones
 */
export async function processAlerts() {
  const generatedAlerts = await generateRenewalAlerts();
  const sentCount = await sendPendingAlerts();

  return {
    generated: generatedAlerts.length,
    sent: sentCount,
  };
}
