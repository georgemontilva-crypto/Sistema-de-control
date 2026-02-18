import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users,
  clients, InsertClient,
  services, InsertService,
  payments, InsertPayment,
  invoices, InsertInvoice,
  invoiceItems, InsertInvoiceItem,
  alerts, InsertAlert
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================
// CLIENTS
// ============================================

export async function getAllClients() {
  try {
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(clients).where(eq(clients.isActive, 1)).orderBy(clients.name);
  } catch (error) {
    console.error('[DB Error] getAllClients:', error);
    return [];
  }
}

export async function getClientById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  return result[0];
}

export async function createClient(client: InsertClient) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(clients).values(client);
  return Number(result.insertId);
}

export async function updateClient(id: number, data: Partial<InsertClient>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(clients).set(data).where(eq(clients.id, id));
}

export async function deleteClient(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Soft delete
  await db.update(clients).set({ isActive: 0 }).where(eq(clients.id, id));
}

export async function searchClients(query: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(clients)
    .where(eq(clients.isActive, 1))
    .orderBy(clients.name);
}

// ============================================
// SERVICES
// ============================================

export async function getServicesByClient(clientId: number) {
  try {
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(services).where(eq(services.clientId, clientId));
  } catch (error) {
    console.error('[DB Error] getServicesByClient:', error);
    return [];
  }
}

export async function getServiceById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(services).where(eq(services.id, id)).limit(1);
  return result[0];
}

export async function createService(service: InsertService) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(services).values(service);
  return Number(result.insertId);
}

export async function updateService(id: number, data: Partial<InsertService>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(services).set(data).where(eq(services.id, id));
}

export async function deleteService(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(services).where(eq(services.id, id));
}

export async function getUpcomingRenewals(daysAhead: number = 30) {
  try {
    const db = await getDb();
    if (!db) return [];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    return await db.select().from(services)
      .where(eq(services.status, "activo"))
      .orderBy(services.renewalDate);
  } catch (error) {
    console.error('[DB Error] getUpcomingRenewals:', error);
    return [];
  }
}

// ============================================
// PAYMENTS
// ============================================

export async function getPaymentsByClient(clientId: number) {
  try {
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(payments)
      .where(eq(payments.clientId, clientId))
      .orderBy(payments.dueDate);
  } catch (error) {
    console.error('[DB Error] getPaymentsByClient:', error);
    return [];
  }
}

export async function getPaymentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
  return result[0];
}

export async function createPayment(payment: InsertPayment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(payments).values(payment);
  return Number(result.insertId);
}

export async function updatePayment(id: number, data: Partial<InsertPayment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(payments).set(data).where(eq(payments.id, id));
}

export async function getPendingPayments() {
  try {
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(payments)
      .where(eq(payments.status, "pendiente"))
      .orderBy(payments.dueDate);
  } catch (error) {
    console.error('[DB Error] getPendingPayments:', error);
    return [];
  }
}

export async function getOverduePayments() {
  try {
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(payments)
      .where(eq(payments.status, "vencido"))
      .orderBy(payments.dueDate);
  } catch (error) {
    console.error('[DB Error] getOverduePayments:', error);
    return [];
  }
}

// ============================================
// INVOICES
// ============================================

export async function getInvoicesByClient(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(invoices)
    .where(eq(invoices.clientId, clientId))
    .orderBy(invoices.issueDate);
}

export async function getInvoiceById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
  return result[0];
}

export async function createInvoice(invoice: InsertInvoice) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(invoices).values(invoice);
  return Number(result.insertId);
}

export async function updateInvoice(id: number, data: Partial<InsertInvoice>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(invoices).set(data).where(eq(invoices.id, id));
}

// ============================================
// INVOICE ITEMS
// ============================================

export async function getInvoiceItems(invoiceId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
}

export async function createInvoiceItem(item: InsertInvoiceItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(invoiceItems).values(item);
  return Number(result.insertId);
}

// ============================================
// ALERTS
// ============================================

export async function getPendingAlerts() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(alerts)
    .where(eq(alerts.isSent, 0))
    .orderBy(alerts.alertDate);
}

export async function createAlert(alert: InsertAlert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(alerts).values(alert);
  return Number(result.insertId);
}

export async function markAlertAsSent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(alerts).set({ isSent: 1, sentAt: new Date() }).where(eq(alerts.id, id));
}
