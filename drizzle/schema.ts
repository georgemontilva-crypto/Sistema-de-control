import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Clientes - Información de contacto y datos principales
 */
export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  document: varchar("document", { length: 100 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  address: text("address"),
  contactPerson: varchar("contactPerson", { length: 255 }),
  notes: text("notes"),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

/**
 * Servicios - Hosting, dominios, correos por cliente
 */
export const services = mysqlTable("services", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  serviceType: mysqlEnum("serviceType", ["hosting", "dominio", "correos", "ssl", "mantenimiento", "otro"]).notNull(),
  serviceName: varchar("serviceName", { length: 255 }).notNull(),
  platform: varchar("platform", { length: 255 }),
  startDate: timestamp("startDate").notNull(),
  renewalDate: timestamp("renewalDate").notNull(),
  billingCycle: mysqlEnum("billingCycle", ["mensual", "anual", "otro"]).notNull(),
  amount: int("amount").notNull(), // Stored in cents to avoid decimal issues
  status: mysqlEnum("status", ["activo", "suspendido", "cancelado"]).default("activo").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;

/**
 * Pagos - Registro de cobros realizados
 */
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  serviceId: int("serviceId"),
  amount: int("amount").notNull(), // Stored in cents
  paymentDate: timestamp("paymentDate").notNull(),
  dueDate: timestamp("dueDate").notNull(),
  status: mysqlEnum("status", ["pendiente", "pagado", "vencido"]).default("pendiente").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 100 }),
  reference: varchar("reference", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/**
 * Facturas - PDFs generados y almacenados en S3
 */
export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  invoiceNumber: varchar("invoiceNumber", { length: 100 }).notNull().unique(),
  clientId: int("clientId").notNull(),
  issueDate: timestamp("issueDate").notNull(),
  dueDate: timestamp("dueDate").notNull(),
  totalAmount: int("totalAmount").notNull(), // Stored in cents
  status: mysqlEnum("status", ["borrador", "emitida", "pagada", "vencida", "anulada"]).default("borrador").notNull(),
  pdfUrl: varchar("pdfUrl", { length: 500 }),
  pdfKey: varchar("pdfKey", { length: 500 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

/**
 * Líneas de factura - Detalle de servicios en cada factura
 */
export const invoiceItems = mysqlTable("invoiceItems", {
  id: int("id").autoincrement().primaryKey(),
  invoiceId: int("invoiceId").notNull(),
  serviceId: int("serviceId"),
  description: text("description").notNull(),
  quantity: int("quantity").default(1).notNull(),
  unitPrice: int("unitPrice").notNull(), // Stored in cents
  totalPrice: int("totalPrice").notNull(), // Stored in cents
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type InsertInvoiceItem = typeof invoiceItems.$inferInsert;

/**
 * Alertas - Sistema de notificaciones automáticas
 */
export const alerts = mysqlTable("alerts", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  serviceId: int("serviceId"),
  alertType: mysqlEnum("alertType", ["vencimiento_7d", "vencimiento_3d", "vencimiento_hoy", "pago_vencido"]).notNull(),
  alertDate: timestamp("alertDate").notNull(),
  message: text("message").notNull(),
  isSent: int("isSent").default(0).notNull(),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;