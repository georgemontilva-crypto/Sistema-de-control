import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { processAlerts } from "./alertService";
import { createInvoice, getInvoiceDetails } from "./invoiceService";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============================================
  // CLIENTS
  // ============================================
  clients: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllClients();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getClientById(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          document: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().email().optional(),
          address: z.string().optional(),
          contactPerson: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const id = await db.createClient(input);
        return { id };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).optional(),
          document: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().email().optional(),
          address: z.string().optional(),
          contactPerson: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateClient(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteClient(input.id);
        return { success: true };
      }),

    search: protectedProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        return await db.searchClients(input.query);
      }),
  }),

  // ============================================
  // SERVICES
  // ============================================
  services: router({
    listByClient: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ input }) => {
        return await db.getServicesByClient(input.clientId);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getServiceById(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          clientId: z.number(),
          serviceType: z.enum(["hosting", "dominio", "correos", "ssl", "mantenimiento", "otro"]),
          serviceName: z.string().min(1),
          platform: z.string().optional(),
          startDate: z.date(),
          renewalDate: z.date(),
          billingCycle: z.enum(["mensual", "anual", "otro"]),
          amount: z.number().int().positive(), // Amount in cents
          status: z.enum(["activo", "suspendido", "cancelado"]).default("activo"),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const id = await db.createService(input);
        return { id };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          serviceType: z.enum(["hosting", "dominio", "correos", "ssl", "mantenimiento", "otro"]).optional(),
          serviceName: z.string().min(1).optional(),
          platform: z.string().optional(),
          startDate: z.date().optional(),
          renewalDate: z.date().optional(),
          billingCycle: z.enum(["mensual", "anual", "otro"]).optional(),
          amount: z.number().int().positive().optional(),
          status: z.enum(["activo", "suspendido", "cancelado"]).optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateService(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteService(input.id);
        return { success: true };
      }),

    upcomingRenewals: protectedProcedure
      .input(z.object({ daysAhead: z.number().default(30) }))
      .query(async ({ input }) => {
        return await db.getUpcomingRenewals(input.daysAhead);
      }),
  }),

  // ============================================
  // PAYMENTS
  // ============================================
  payments: router({
    listByClient: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ input }) => {
        return await db.getPaymentsByClient(input.clientId);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getPaymentById(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          clientId: z.number(),
          serviceId: z.number().optional(),
          amount: z.number().int().positive(), // Amount in cents
          paymentDate: z.date(),
          dueDate: z.date(),
          status: z.enum(["pendiente", "pagado", "vencido"]).default("pendiente"),
          paymentMethod: z.string().optional(),
          reference: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const id = await db.createPayment(input);
        return { id };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          amount: z.number().int().positive().optional(),
          paymentDate: z.date().optional(),
          dueDate: z.date().optional(),
          status: z.enum(["pendiente", "pagado", "vencido"]).optional(),
          paymentMethod: z.string().optional(),
          reference: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updatePayment(id, data);
        return { success: true };
      }),

    pending: protectedProcedure.query(async () => {
      return await db.getPendingPayments();
    }),

    overdue: protectedProcedure.query(async () => {
      return await db.getOverduePayments();
    }),
  }),

  // ============================================
  // DASHBOARD
  // ============================================
  dashboard: router({
    summary: protectedProcedure.query(async () => {
      const clients = await db.getAllClients();
      const upcomingRenewals = await db.getUpcomingRenewals(30);
      const pendingPayments = await db.getPendingPayments();
      const overduePayments = await db.getOverduePayments();

      return {
        totalClients: clients.length,
        activeClients: clients.filter(c => c.isActive === 1).length,
        upcomingRenewalsCount: upcomingRenewals.length,
        pendingPaymentsCount: pendingPayments.length,
        overduePaymentsCount: overduePayments.length,
        upcomingRenewals: upcomingRenewals.slice(0, 5),
        recentPendingPayments: pendingPayments.slice(0, 5),
      };
    }),
  }),

  // ============================================
  // ALERTS
  // ============================================
  alerts: router({
    list: protectedProcedure.query(async () => {
      return await db.getPendingAlerts();
    }),

    process: protectedProcedure.mutation(async () => {
      const result = await processAlerts();
      return result;
    }),
  }),

  // ============================================
  // INVOICES
  // ============================================
  invoices: router({
    listByClient: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ input }) => {
        return await db.getInvoicesByClient(input.clientId);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getInvoiceDetails(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          clientId: z.number(),
          items: z.array(
            z.object({
              serviceId: z.number().optional(),
              description: z.string(),
              quantity: z.number().int().positive(),
              unitPrice: z.number().int().positive(),
            })
          ),
          dueDate: z.date(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await createInvoice(input);
      }),
  }),
});

export type AppRouter = typeof appRouter;
