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
import { CheckCircle, Download, DollarSign, Plus, Search, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Payments() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    clientId: "",
    serviceId: "",
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    dueDate: new Date().toISOString().split("T")[0],
    status: "pendiente" as const,
    paymentMethod: "",
    reference: "",
    notes: "",
  });

  const { data: clients } = trpc.clients.list.useQuery();
  const { data: pendingPayments, isLoading: pendingLoading } = trpc.payments.pending.useQuery();
  const { data: overduePayments, isLoading: overdueLoading } = trpc.payments.overdue.useQuery();
  const utils = trpc.useUtils();

  const createPayment = trpc.payments.create.useMutation({
    onSuccess: () => {
      toast.success("Pago registrado exitosamente");
      setIsDialogOpen(false);
      setFormData({
        clientId: "",
        serviceId: "",
        amount: "",
        paymentDate: new Date().toISOString().split("T")[0],
        dueDate: new Date().toISOString().split("T")[0],
        status: "pendiente",
        paymentMethod: "",
        reference: "",
        notes: "",
      });
      utils.payments.pending.invalidate();
      utils.payments.overdue.invalidate();
      utils.dashboard.summary.invalidate();
    },
    onError: (error) => {
      toast.error("Error al registrar pago: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId) {
      toast.error("Selecciona un cliente");
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("El monto debe ser mayor a cero");
      return;
    }

    createPayment.mutate({
      clientId: parseInt(formData.clientId),
      serviceId: formData.serviceId ? parseInt(formData.serviceId) : undefined,
      amount: Math.round(parseFloat(formData.amount) * 100),
      paymentDate: new Date(formData.paymentDate),
      dueDate: new Date(formData.dueDate),
      status: formData.status,
      paymentMethod: formData.paymentMethod || undefined,
      reference: formData.reference || undefined,
      notes: formData.notes || undefined,
    });
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const getClientName = (clientId: number) => {
    const client = clients?.find((c) => c.id === clientId);
    return client?.name || `Cliente #${clientId}`;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pendiente: "bg-chart-3/20 text-chart-3 border-chart-3/50",
      pagado: "bg-chart-2/20 text-chart-2 border-chart-2/50",
      vencido: "bg-destructive/20 text-destructive border-destructive/50",
    };
    return colors[status] || "bg-muted text-muted-foreground";
  };

  const exportToCSV = (payments: any[], filename: string) => {
    if (!payments || payments.length === 0) {
      toast.error("No hay datos para exportar");
      return;
    }

    const headers = ["Cliente", "Monto", "Fecha de Pago", "Fecha de Vencimiento", "Estado", "Método de Pago", "Referencia"];
    const rows = payments.map((payment) => [
      getClientName(payment.clientId),
      formatCurrency(payment.amount),
      new Date(payment.paymentDate).toLocaleDateString("es-ES"),
      new Date(payment.dueDate).toLocaleDateString("es-ES"),
      payment.status,
      payment.paymentMethod || "N/A",
      payment.reference || "N/A",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Archivo CSV descargado exitosamente");
  };

  const allPayments = [...(pendingPayments || []), ...(overduePayments || [])];
  const filteredPayments = allPayments.filter((payment) => {
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    const matchesSearch =
      getClientName(payment.clientId).toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.reference?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Pagos</h1>
          <p className="text-muted-foreground mt-1">
            Historial y gestión de cobros
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl gap-2">
              <Plus className="h-4 w-4" />
              Registrar Pago
            </Button>
          </DialogTrigger>
          <DialogContent className="glass max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-foreground">Registrar Nuevo Pago</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Ingresa los detalles del pago o cobro
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="clientId" className="text-foreground">
                    Cliente *
                  </Label>
                  <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-foreground">
                      Monto (USD) *
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0.00"
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-foreground">
                      Estado *
                    </Label>
                    <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendiente">Pendiente</SelectItem>
                        <SelectItem value="pagado">Pagado</SelectItem>
                        <SelectItem value="vencido">Vencido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentDate" className="text-foreground">
                      Fecha de Pago *
                    </Label>
                    <Input
                      id="paymentDate"
                      type="date"
                      value={formData.paymentDate}
                      onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                      required
                      className="rounded-xl"
                    />
                  </div>
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod" className="text-foreground">
                      Método de Pago
                    </Label>
                    <Input
                      id="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      placeholder="ej: Transferencia, Efectivo"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reference" className="text-foreground">
                      Referencia
                    </Label>
                    <Input
                      id="reference"
                      value={formData.reference}
                      onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                      placeholder="Número de referencia"
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-foreground">
                    Notas
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Información adicional"
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
                <Button type="submit" disabled={createPayment.isPending} className="rounded-xl">
                  {createPayment.isPending ? "Registrando..." : "Registrar Pago"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card className="glass border-2">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente o referencia..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="pagado">Pagado</SelectItem>
                  <SelectItem value="vencido">Vencido</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => exportToCSV(filteredPayments, "pagos")}
                className="rounded-xl gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      {pendingLoading || overdueLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="glass">
              <CardContent className="pt-6">
                <div className="h-16 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPayments.length > 0 ? (
        <Card className="glass border-2">
          <CardHeader>
            <CardTitle className="text-xl text-foreground flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Historial de Pagos
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {filteredPayments.length} {filteredPayments.length === 1 ? "pago encontrado" : "pagos encontrados"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredPayments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 rounded-2xl glass-light hover:bg-accent/10 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-xl ${payment.status === "pagado" ? "bg-chart-2/20" : payment.status === "vencido" ? "bg-destructive/20" : "bg-chart-3/20"}`}>
                      {payment.status === "pagado" ? (
                        <CheckCircle className="h-4 w-4 text-chart-2" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{getClientName(payment.clientId)}</p>
                      <p className="text-sm text-muted-foreground">
                        Vence: {new Date(payment.dueDate).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  {payment.paymentMethod && (
                    <p className="text-xs text-muted-foreground ml-12">
                      Método: {payment.paymentMethod}
                      {payment.reference && ` • Ref: ${payment.reference}`}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground mb-1">
                    {formatCurrency(payment.amount)}
                  </p>
                  <Badge className={`rounded-full ${getStatusColor(payment.status)}`}>
                    {payment.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card className="glass border-2">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <DollarSign className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground">No se encontraron pagos</p>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery || statusFilter !== "all"
                ? "Intenta ajustar los filtros de búsqueda"
                : "Comienza registrando el primer pago"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
