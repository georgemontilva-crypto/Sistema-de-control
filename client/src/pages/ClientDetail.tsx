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
import { ArrowLeft, Calendar, DollarSign, Globe, Mail, Phone, Plus, Server, Trash2 } from "lucide-react";
import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ClientDetail() {
  const params = useParams<{ id: string }>();
  const clientId = parseInt(params.id || "0");
  const [, navigate] = useLocation();
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [deleteServiceId, setDeleteServiceId] = useState<number | null>(null);

  const [serviceFormData, setServiceFormData] = useState({
    serviceType: "hosting" as const,
    serviceName: "",
    platform: "",
    startDate: new Date().toISOString().split("T")[0],
    renewalDate: new Date().toISOString().split("T")[0],
    billingCycle: "mensual" as const,
    amount: "",
    notes: "",
  });

  const { data: client, isLoading: clientLoading } = trpc.clients.getById.useQuery({ id: clientId });
  const { data: services, isLoading: servicesLoading } = trpc.services.listByClient.useQuery({ clientId });
  const utils = trpc.useUtils();

  const createService = trpc.services.create.useMutation({
    onSuccess: () => {
      toast.success("Servicio creado exitosamente");
      setIsServiceDialogOpen(false);
      setServiceFormData({
        serviceType: "hosting",
        serviceName: "",
        platform: "",
        startDate: new Date().toISOString().split("T")[0],
        renewalDate: new Date().toISOString().split("T")[0],
        billingCycle: "mensual",
        amount: "",
        notes: "",
      });
      utils.services.listByClient.invalidate({ clientId });
      utils.dashboard.summary.invalidate();
    },
    onError: (error) => {
      toast.error("Error al crear servicio: " + error.message);
    },
  });

  const deleteService = trpc.services.delete.useMutation({
    onSuccess: () => {
      toast.success("Servicio eliminado exitosamente");
      setDeleteServiceId(null);
      utils.services.listByClient.invalidate({ clientId });
      utils.dashboard.summary.invalidate();
    },
    onError: (error) => {
      toast.error("Error al eliminar servicio: " + error.message);
    },
  });

  const handleServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceFormData.serviceName.trim()) {
      toast.error("El nombre del servicio es requerido");
      return;
    }
    if (!serviceFormData.amount || parseFloat(serviceFormData.amount) <= 0) {
      toast.error("El monto debe ser mayor a cero");
      return;
    }

    createService.mutate({
      clientId,
      serviceType: serviceFormData.serviceType,
      serviceName: serviceFormData.serviceName,
      platform: serviceFormData.platform || undefined,
      startDate: new Date(serviceFormData.startDate),
      renewalDate: new Date(serviceFormData.renewalDate),
      billingCycle: serviceFormData.billingCycle,
      amount: Math.round(parseFloat(serviceFormData.amount) * 100), // Convert to cents
      notes: serviceFormData.notes || undefined,
    });
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const getServiceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      hosting: "Hosting",
      dominio: "Dominio",
      correos: "Correos",
      ssl: "SSL",
      mantenimiento: "Mantenimiento",
      otro: "Otro",
    };
    return labels[type] || type;
  };

  const getServiceIcon = (type: string) => {
    const icons: Record<string, typeof Server> = {
      hosting: Server,
      dominio: Globe,
      correos: Mail,
      ssl: Server,
      mantenimiento: Server,
      otro: Server,
    };
    const Icon = icons[type] || Server;
    return <Icon className="h-5 w-5" />;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      activo: "bg-chart-2/20 text-chart-2 border-chart-2/50",
      suspendido: "bg-chart-3/20 text-chart-3 border-chart-3/50",
      cancelado: "bg-destructive/20 text-destructive border-destructive/50",
    };
    return colors[status] || "bg-muted text-muted-foreground";
  };

  if (clientLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <Card className="glass">
          <CardHeader>
            <div className="h-6 w-48 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 w-full bg-muted animate-pulse rounded" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-muted-foreground mb-4">Cliente no encontrado</p>
        <Button onClick={() => navigate("/clients")} className="rounded-xl">
          Volver a Clientes
        </Button>
      </div>
    );
  }

  const totalMonthlyAmount = services?.reduce((sum, service) => {
    if (service.billingCycle === "mensual" && service.status === "activo") {
      return sum + service.amount;
    }
    return sum;
  }, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/clients")}
          className="rounded-xl"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{client.name}</h1>
          <p className="text-muted-foreground mt-1">
            Información del cliente y servicios contratados
          </p>
        </div>
      </div>

      {/* Client Information */}
      <Card className="glass border-2">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">Información del Cliente</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {client.document && (
            <div>
              <p className="text-sm text-muted-foreground">Documento / NIT</p>
              <p className="text-foreground font-medium">{client.document}</p>
            </div>
          )}
          {client.email && (
            <div>
              <p className="text-sm text-muted-foreground">Correo Electrónico</p>
              <p className="text-foreground font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {client.email}
              </p>
            </div>
          )}
          {client.phone && (
            <div>
              <p className="text-sm text-muted-foreground">Teléfono</p>
              <p className="text-foreground font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {client.phone}
              </p>
            </div>
          )}
          {client.contactPerson && (
            <div>
              <p className="text-sm text-muted-foreground">Persona de Contacto</p>
              <p className="text-foreground font-medium">{client.contactPerson}</p>
            </div>
          )}
          {client.address && (
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">Dirección</p>
              <p className="text-foreground font-medium">{client.address}</p>
            </div>
          )}
          {client.notes && (
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">Notas</p>
              <p className="text-foreground">{client.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Services Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Servicios</h2>
          <p className="text-sm text-muted-foreground">
            Total mensual: <span className="font-semibold text-primary">{formatCurrency(totalMonthlyAmount)}</span>
          </p>
        </div>
        <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl gap-2">
              <Plus className="h-4 w-4" />
              Agregar Servicio
            </Button>
          </DialogTrigger>
          <DialogContent className="glass max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-foreground">Agregar Nuevo Servicio</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Registra un nuevo servicio para {client.name}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleServiceSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="serviceType" className="text-foreground">
                      Tipo de Servicio *
                    </Label>
                    <Select
                      value={serviceFormData.serviceType}
                      onValueChange={(value: any) =>
                        setServiceFormData({ ...serviceFormData, serviceType: value })
                      }
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hosting">Hosting</SelectItem>
                        <SelectItem value="dominio">Dominio</SelectItem>
                        <SelectItem value="correos">Correos</SelectItem>
                        <SelectItem value="ssl">SSL</SelectItem>
                        <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="serviceName" className="text-foreground">
                      Nombre del Servicio *
                    </Label>
                    <Input
                      id="serviceName"
                      value={serviceFormData.serviceName}
                      onChange={(e) =>
                        setServiceFormData({ ...serviceFormData, serviceName: e.target.value })
                      }
                      placeholder="ej: ejemplo.com"
                      required
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="platform" className="text-foreground">
                    Plataforma / Proveedor
                  </Label>
                  <Input
                    id="platform"
                    value={serviceFormData.platform}
                    onChange={(e) =>
                      setServiceFormData({ ...serviceFormData, platform: e.target.value })
                    }
                    placeholder="ej: HostGator, GoDaddy, etc."
                    className="rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-foreground">
                      Fecha de Inicio *
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={serviceFormData.startDate}
                      onChange={(e) =>
                        setServiceFormData({ ...serviceFormData, startDate: e.target.value })
                      }
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="renewalDate" className="text-foreground">
                      Fecha de Renovación *
                    </Label>
                    <Input
                      id="renewalDate"
                      type="date"
                      value={serviceFormData.renewalDate}
                      onChange={(e) =>
                        setServiceFormData({ ...serviceFormData, renewalDate: e.target.value })
                      }
                      required
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="billingCycle" className="text-foreground">
                      Ciclo de Facturación *
                    </Label>
                    <Select
                      value={serviceFormData.billingCycle}
                      onValueChange={(value: any) =>
                        setServiceFormData({ ...serviceFormData, billingCycle: value })
                      }
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mensual">Mensual</SelectItem>
                        <SelectItem value="anual">Anual</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-foreground">
                      Monto (USD) *
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={serviceFormData.amount}
                      onChange={(e) =>
                        setServiceFormData({ ...serviceFormData, amount: e.target.value })
                      }
                      placeholder="0.00"
                      required
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
                    value={serviceFormData.notes}
                    onChange={(e) =>
                      setServiceFormData({ ...serviceFormData, notes: e.target.value })
                    }
                    placeholder="Información adicional sobre el servicio"
                    rows={3}
                    className="rounded-xl"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsServiceDialogOpen(false)}
                  className="rounded-xl"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={createService.isPending} className="rounded-xl">
                  {createService.isPending ? "Creando..." : "Crear Servicio"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Services List */}
      {servicesLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="glass">
              <CardHeader>
                <div className="h-6 w-32 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="h-4 w-full bg-muted animate-pulse rounded" />
                <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : services && services.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {services.map((service) => (
            <Card
              key={service.id}
              className="glass border-2 hover:border-primary/50 transition-all duration-300 group"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      {getServiceIcon(service.serviceType)}
                    </div>
                    <div>
                      <CardTitle className="text-lg text-foreground">{service.serviceName}</CardTitle>
                      <CardDescription className="text-xs">
                        <Badge variant="outline" className="rounded-full mt-1">
                          {getServiceTypeLabel(service.serviceType)}
                        </Badge>
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setDeleteServiceId(service.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {service.platform && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Server className="h-4 w-4" />
                    <span>{service.platform}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Renovación:{" "}
                    {new Date(service.renewalDate).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="text-lg font-bold text-foreground">
                      {formatCurrency(service.amount)}
                    </span>
                    <span className="text-xs text-muted-foreground">/ {service.billingCycle}</span>
                  </div>
                  <Badge className={`rounded-full ${getStatusColor(service.status)}`}>
                    {service.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="glass border-2">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Server className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground">No hay servicios registrados</p>
            <p className="text-sm text-muted-foreground mt-1">
              Comienza agregando el primer servicio para este cliente
            </p>
          </CardContent>
        </Card>
      )}

      {/* Delete Service Confirmation */}
      <AlertDialog open={deleteServiceId !== null} onOpenChange={() => setDeleteServiceId(null)}>
        <AlertDialogContent className="glass">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">¿Eliminar servicio?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Esta acción eliminará el servicio permanentemente. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteServiceId && deleteService.mutate({ id: deleteServiceId })}
              className="rounded-xl bg-destructive hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
