import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Invoices() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [items, setItems] = useState<
    Array<{
      serviceId?: number;
      description: string;
      quantity: string;
      unitPrice: string;
    }>
  >([{ description: "", quantity: "1", unitPrice: "" }]);

  const [formData, setFormData] = useState({
    dueDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const { data: clients } = trpc.clients.list.useQuery();
  const { data: services } = trpc.services.listByClient.useQuery(
    { clientId: selectedClient! },
    { enabled: !!selectedClient }
  );
  const utils = trpc.useUtils();

  const createInvoice = trpc.invoices.create.useMutation({
    onSuccess: (data) => {
      toast.success(`Factura ${data.invoiceNumber} creada exitosamente`);
      setIsDialogOpen(false);
      setSelectedClient(null);
      setItems([{ description: "", quantity: "1", unitPrice: "" }]);
      setFormData({
        dueDate: new Date().toISOString().split("T")[0],
        notes: "",
      });
      utils.clients.list.invalidate();
    },
    onError: (error) => {
      toast.error("Error al crear factura: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClient) {
      toast.error("Selecciona un cliente");
      return;
    }

    const validItems = items.filter(
      (item) => item.description.trim() && parseFloat(item.unitPrice) > 0
    );

    if (validItems.length === 0) {
      toast.error("Agrega al menos un ítem válido");
      return;
    }

    createInvoice.mutate({
      clientId: selectedClient,
      items: validItems.map((item) => ({
        serviceId: item.serviceId,
        description: item.description,
        quantity: parseInt(item.quantity) || 1,
        unitPrice: Math.round(parseFloat(item.unitPrice) * 100),
      })),
      dueDate: new Date(formData.dueDate),
      notes: formData.notes || undefined,
    });
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: "1", unitPrice: "" }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const quantity = parseInt(item.quantity) || 0;
      const price = parseFloat(item.unitPrice) || 0;
      return sum + quantity * price;
    }, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      emitida: "bg-blue-500/20 text-blue-500 border-blue-500/50",
      pagada: "bg-chart-2/20 text-chart-2 border-chart-2/50",
      vencida: "bg-destructive/20 text-destructive border-destructive/50",
      borrador: "bg-muted text-muted-foreground border-border",
    };
    return colors[status] || "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Facturas</h1>
          <p className="text-muted-foreground mt-1">
            Genera y gestiona facturas profesionales
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl gap-2">
              <Plus className="h-4 w-4" />
              Nueva Factura
            </Button>
          </DialogTrigger>
          <DialogContent className="glass max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-foreground">Crear Nueva Factura</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Genera una factura profesional en PDF
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-6 py-4">
                {/* Client Selection */}
                <div className="space-y-2">
                  <Label htmlFor="clientId" className="text-foreground">
                    Cliente *
                  </Label>
                  <Select
                    value={selectedClient?.toString() || ""}
                    onValueChange={(value) => setSelectedClient(parseInt(value))}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Selecciona un cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients?.map((client) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Invoice Items */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-foreground">Ítems de Factura *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addItem}
                      className="rounded-xl"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Ítem
                    </Button>
                  </div>

                  {items.map((item, index) => (
                    <Card key={index} className="glass-light border">
                      <CardContent className="pt-4">
                        <div className="grid gap-4">
                          <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-5">
                              <Label className="text-sm text-muted-foreground">Descripción</Label>
                              <Input
                                value={item.description}
                                onChange={(e) => updateItem(index, "description", e.target.value)}
                                placeholder="Descripción del servicio"
                                className="rounded-xl mt-1"
                              />
                            </div>
                            <div className="col-span-2">
                              <Label className="text-sm text-muted-foreground">Cantidad</Label>
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateItem(index, "quantity", e.target.value)}
                                className="rounded-xl mt-1"
                              />
                            </div>
                            <div className="col-span-3">
                              <Label className="text-sm text-muted-foreground">Precio Unit.</Label>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={item.unitPrice}
                                onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                                placeholder="0.00"
                                className="rounded-xl mt-1"
                              />
                            </div>
                            <div className="col-span-2 flex items-end">
                              {items.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeItem(index)}
                                  className="rounded-xl"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              )}
                            </div>
                          </div>

                          {selectedClient && services && (
                            <div>
                              <Label className="text-sm text-muted-foreground">
                                O selecciona un servicio existente
                              </Label>
                              <Select
                                value={item.serviceId?.toString() || ""}
                                onValueChange={(value) => {
                                  const service = services.find((s) => s.id === parseInt(value));
                                  if (service) {
                                    updateItem(index, "serviceId", value);
                                    updateItem(index, "description", service.serviceName);
                                    updateItem(index, "unitPrice", (service.amount / 100).toString());
                                  }
                                }}
                              >
                                <SelectTrigger className="rounded-xl mt-1">
                                  <SelectValue placeholder="Seleccionar servicio" />
                                </SelectTrigger>
                                <SelectContent>
                                  {services.map((service) => (
                                    <SelectItem key={service.id} value={service.id.toString()}>
                                      {service.serviceName} - {formatCurrency(service.amount / 100)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Total */}
                <div className="flex justify-end">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-3xl font-bold text-primary">
                      {formatCurrency(calculateTotal())}
                    </p>
                  </div>
                </div>

                {/* Due Date */}
                <div className="space-y-2">
                  <Label htmlFor="dueDate" className="text-foreground">
                    Fecha de Vencimiento *
                  </Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    required
                    className="rounded-xl"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-foreground">
                    Notas
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Información adicional para la factura"
                    rows={3}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="rounded-xl"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={createInvoice.isPending} className="rounded-xl">
                  {createInvoice.isPending ? "Generando..." : "Generar Factura"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Recent Invoices by Client */}
      <Card className="glass border-2">
        <CardHeader>
          <CardTitle className="text-xl text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Facturas por Cliente
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Selecciona un cliente para ver sus facturas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clients?.map((client) => (
              <ClientInvoiceCard key={client.id} clientId={client.id} clientName={client.name} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ClientInvoiceCard({ clientId, clientName }: { clientId: number; clientName: string }) {
  const { data: invoices } = trpc.invoices.listByClient.useQuery({ clientId });

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      emitida: "bg-blue-500/20 text-blue-500 border-blue-500/50",
      pagada: "bg-chart-2/20 text-chart-2 border-chart-2/50",
      vencida: "bg-destructive/20 text-destructive border-destructive/50",
      borrador: "bg-muted text-muted-foreground border-border",
    };
    return colors[status] || "bg-muted text-muted-foreground";
  };

  return (
    <Card className="glass-light border-2 hover:border-primary/50 transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-lg text-foreground">{clientName}</CardTitle>
        <CardDescription className="text-xs">
          {invoices?.length || 0} {invoices?.length === 1 ? "factura" : "facturas"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {invoices && invoices.length > 0 ? (
          invoices.slice(0, 3).map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between p-3 rounded-xl bg-background/50"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{invoice.invoiceNumber}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(invoice.issueDate).toLocaleDateString("es-ES")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">
                  {formatCurrency(invoice.totalAmount)}
                </p>
                <Badge className={`rounded-full text-xs ${getStatusColor(invoice.status)}`}>
                  {invoice.status}
                </Badge>
              </div>
              {invoice.pdfUrl && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-xl ml-2"
                  onClick={() => window.open(invoice.pdfUrl!, "_blank")}
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Sin facturas
          </p>
        )}
      </CardContent>
    </Card>
  );
}
