import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { AlertCircle, Calendar, CheckCircle, DollarSign, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export default function Dashboard() {
  const { data: summary, isLoading } = trpc.dashboard.summary.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="glass">
              <CardHeader className="pb-3">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">No se pudo cargar el resumen</p>
      </div>
    );
  }

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Resumen general de clientes y servicios
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass border-2 hover:border-primary/50 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Clientes
            </CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{summary.totalClients}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.activeClients} activos
            </p>
          </CardContent>
        </Card>

        <Card className="glass border-2 hover:border-accent/50 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Próximas Renovaciones
            </CardTitle>
            <Calendar className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {summary.upcomingRenewalsCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Próximos 30 días
            </p>
          </CardContent>
        </Card>

        <Card className="glass border-2 hover:border-chart-3/50 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pagos Pendientes
            </CardTitle>
            <DollarSign className="h-5 w-5 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {summary.pendingPaymentsCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Por cobrar
            </p>
          </CardContent>
        </Card>

        <Card className="glass border-2 hover:border-destructive/50 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pagos Vencidos
            </CardTitle>
            <AlertCircle className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">
              {summary.overduePaymentsCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Requieren atención
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Renewals Table */}
      <Card className="glass border-2">
        <CardHeader>
          <CardTitle className="text-xl text-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Próximas Renovaciones
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Servicios que vencen en los próximos 30 días
          </CardDescription>
        </CardHeader>
        <CardContent>
          {summary.upcomingRenewals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                No hay renovaciones próximas en los siguientes 30 días
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {summary.upcomingRenewals.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-4 rounded-2xl glass-light hover:bg-accent/10 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="rounded-full">
                        {getServiceTypeLabel(service.serviceType)}
                      </Badge>
                      <p className="font-medium text-foreground">{service.serviceName}</p>
                    </div>
                    {service.platform && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Plataforma: {service.platform}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {formatCurrency(service.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Vence{" "}
                      {formatDistanceToNow(new Date(service.renewalDate), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Pending Payments */}
      <Card className="glass border-2">
        <CardHeader>
          <CardTitle className="text-xl text-foreground flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-chart-3" />
            Pagos Pendientes Recientes
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Últimos pagos por cobrar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {summary.recentPendingPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                No hay pagos pendientes
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {summary.recentPendingPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 rounded-2xl glass-light hover:bg-accent/10 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      Cliente ID: {payment.clientId}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Vence:{" "}
                      {new Date(payment.dueDate).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">
                      {formatCurrency(payment.amount)}
                    </p>
                    <Badge
                      variant={payment.status === "vencido" ? "destructive" : "secondary"}
                      className="rounded-full"
                    >
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
