import * as db from "./db";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

/**
 * Generate invoice number
 */
function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const random = nanoid(6).toUpperCase();
  return `INV-${year}${month}-${random}`;
}

/**
 * Generate HTML template for invoice
 */
function generateInvoiceHTML(invoice: any, client: any, items: any[]): string {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Factura ${invoice.invoiceNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #f5f5f5;
      padding: 40px 20px;
    }
    
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    
    .invoice-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
    }
    
    .invoice-header h1 {
      font-size: 32px;
      margin-bottom: 10px;
    }
    
    .invoice-number {
      font-size: 18px;
      opacity: 0.9;
    }
    
    .invoice-body {
      padding: 40px;
    }
    
    .info-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
      gap: 40px;
    }
    
    .info-block h3 {
      color: #667eea;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 15px;
    }
    
    .info-block p {
      color: #333;
      line-height: 1.6;
      margin-bottom: 5px;
    }
    
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    
    .items-table thead {
      background: #f8f9fa;
    }
    
    .items-table th {
      padding: 15px;
      text-align: left;
      font-weight: 600;
      color: #667eea;
      border-bottom: 2px solid #667eea;
    }
    
    .items-table td {
      padding: 15px;
      border-bottom: 1px solid #e9ecef;
      color: #333;
    }
    
    .items-table tbody tr:hover {
      background: #f8f9fa;
    }
    
    .text-right {
      text-align: right;
    }
    
    .totals-section {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #e9ecef;
    }
    
    .total-row {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 10px;
      font-size: 16px;
    }
    
    .total-row.grand-total {
      font-size: 24px;
      font-weight: bold;
      color: #667eea;
      margin-top: 15px;
      padding-top: 15px;
      border-top: 2px solid #667eea;
    }
    
    .total-label {
      margin-right: 40px;
      min-width: 150px;
      text-align: right;
    }
    
    .total-value {
      min-width: 150px;
      text-align: right;
    }
    
    .invoice-footer {
      background: #f8f9fa;
      padding: 30px 40px;
      text-align: center;
      color: #6c757d;
      font-size: 14px;
    }
    
    .status-badge {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .status-emitida {
      background: #e3f2fd;
      color: #1976d2;
    }
    
    .status-pagada {
      background: #e8f5e9;
      color: #388e3c;
    }
    
    .status-vencida {
      background: #ffebee;
      color: #d32f2f;
    }
    
    .status-borrador {
      background: #f5f5f5;
      color: #757575;
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="invoice-header">
      <h1>FACTURA</h1>
      <div class="invoice-number">${invoice.invoiceNumber}</div>
    </div>
    
    <div class="invoice-body">
      <div class="info-section">
        <div class="info-block">
          <h3>Facturado a</h3>
          <p><strong>${client.name}</strong></p>
          ${client.document ? `<p>${client.document}</p>` : ""}
          ${client.email ? `<p>${client.email}</p>` : ""}
          ${client.phone ? `<p>${client.phone}</p>` : ""}
          ${client.address ? `<p>${client.address}</p>` : ""}
        </div>
        
        <div class="info-block">
          <h3>Detalles de Factura</h3>
          <p><strong>Fecha de Emisión:</strong> ${formatDate(invoice.issueDate)}</p>
          <p><strong>Fecha de Vencimiento:</strong> ${formatDate(invoice.dueDate)}</p>
          <p><strong>Estado:</strong> <span class="status-badge status-${invoice.status}">${invoice.status}</span></p>
        </div>
      </div>
      
      <table class="items-table">
        <thead>
          <tr>
            <th>Descripción</th>
            <th class="text-right">Cantidad</th>
            <th class="text-right">Precio Unitario</th>
            <th class="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${items
            .map(
              (item) => `
            <tr>
              <td>${item.description}</td>
              <td class="text-right">${item.quantity}</td>
              <td class="text-right">${formatCurrency(item.unitPrice)}</td>
              <td class="text-right">${formatCurrency(item.totalPrice)}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
      
      <div class="totals-section">
        <div class="total-row grand-total">
          <div class="total-label">TOTAL</div>
          <div class="total-value">${formatCurrency(invoice.totalAmount)}</div>
        </div>
      </div>
      
      ${
        invoice.notes
          ? `
        <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
          <h3 style="color: #667eea; margin-bottom: 10px; font-size: 14px;">Notas</h3>
          <p style="color: #333; line-height: 1.6;">${invoice.notes}</p>
        </div>
      `
          : ""
      }
    </div>
    
    <div class="invoice-footer">
      <p>Gracias por su preferencia</p>
      <p style="margin-top: 10px;">Esta es una factura generada electrónicamente</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Create invoice with items and generate PDF
 */
export async function createInvoice(data: {
  clientId: number;
  items: Array<{
    serviceId?: number;
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  dueDate: Date;
  notes?: string;
}) {
  // Calculate total amount
  const totalAmount = data.items.reduce((sum, item) => {
    return sum + item.quantity * item.unitPrice;
  }, 0);

  // Create invoice record
  const invoiceNumber = generateInvoiceNumber();
  const invoiceId = await db.createInvoice({
    invoiceNumber,
    clientId: data.clientId,
    issueDate: new Date(),
    dueDate: data.dueDate,
    totalAmount,
    status: "emitida",
    notes: data.notes,
  });

  // Create invoice items
  for (const item of data.items) {
    await db.createInvoiceItem({
      invoiceId,
      serviceId: item.serviceId,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.quantity * item.unitPrice,
    });
  }

  // Generate PDF
  const invoice = await db.getInvoiceById(invoiceId);
  const client = await db.getClientById(data.clientId);
  const items = await db.getInvoiceItems(invoiceId);

  if (!invoice || !client) {
    throw new Error("Invoice or client not found");
  }

  const html = generateInvoiceHTML(invoice, client, items);

  // For now, we'll store the HTML as a simple text file
  // In production, you would use a proper PDF generation library
  const fileKey = `invoices/${invoiceNumber}-${nanoid(8)}.html`;
  const htmlBuffer = Buffer.from(html, "utf-8");
  
  const { url } = await storagePut(fileKey, htmlBuffer, "text/html");

  // Update invoice with PDF URL
  await db.updateInvoice(invoiceId, {
    pdfUrl: url,
    pdfKey: fileKey,
  });

  return {
    invoiceId,
    invoiceNumber,
    pdfUrl: url,
  };
}

/**
 * Get invoice with all details
 */
export async function getInvoiceDetails(invoiceId: number) {
  const invoice = await db.getInvoiceById(invoiceId);
  if (!invoice) {
    throw new Error("Invoice not found");
  }

  const client = await db.getClientById(invoice.clientId);
  const items = await db.getInvoiceItems(invoiceId);

  return {
    invoice,
    client,
    items,
  };
}
