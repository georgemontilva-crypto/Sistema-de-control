import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterType, setFilterType] = useState<string>("all");

  const { data: services, isLoading } = trpc.services.upcomingRenewals.useQuery({ daysAhead: 90 });
  const { data: clients } = trpc.clients.list.useQuery();

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

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getServicesForDate = (day: number) => {
    if (!services) return [];
    
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    return services.filter((service) => {
      if (filterType !== "all" && service.serviceType !== filterType) {
        return false;
      }
      
      const renewalDate = new Date(service.renewalDate);
      return (
        renewalDate.getDate() === targetDate.getDate() &&
        renewalDate.getMonth() === targetDate.getMonth() &&
        renewalDate.getFullYear() === targetDate.getFullYear()
      );
    });
  };

  const getClientName = (clientId: number) => {
    const client = clients?.find((c) => c.id === clientId);
    return client?.name || `Cliente #${clientId}`;
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" });

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const today = new Date();
  const isToday = (day: number | null) => {
    if (!day) return false;
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Calendario de Pagos</h1>
        <p className="text-muted-foreground mt-1">
          Vista mensual de renovaciones y vencimientos
        </p>
      </div>

      {/* Controls */}
      <Card className="glass border-2">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={previousMonth}
                className="rounded-xl"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold text-foreground capitalize min-w-[200px] text-center">
                {monthName}
              </h2>
              <Button
                variant="outline"
                size="icon"
                onClick={nextMonth}
                className="rounded-xl"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Filtrar por:</span>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px] rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los servicios</SelectItem>
                  <SelectItem value="hosting">Hosting</SelectItem>
                  <SelectItem value="dominio">Dominio</SelectItem>
                  <SelectItem value="correos">Correos</SelectItem>
                  <SelectItem value="ssl">SSL</SelectItem>
                  <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <Card className="glass border-2">
        <CardHeader>
          <CardTitle className="text-xl text-foreground flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Calendario Mensual
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Haz clic en un día para ver los detalles de las renovaciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-7 gap-2">
              {[...Array(35)].map((_, i) => (
                <div key={i} className="aspect-square bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <>
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-semibold text-muted-foreground py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => {
                  const dayServices = day ? getServicesForDate(day) : [];
                  const hasServices = dayServices.length > 0;

                  return (
                    <div
                      key={index}
                      className={`
                        aspect-square p-2 rounded-2xl border-2 transition-all duration-300
                        ${day ? "glass-light hover:border-primary/50 cursor-pointer" : "border-transparent"}
                        ${isToday(day) ? "border-primary bg-primary/10" : "border-border"}
                        ${hasServices ? "bg-accent/20" : ""}
                      `}
                    >
                      {day && (
                        <div className="h-full flex flex-col">
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className={`text-sm font-medium ${
                                isToday(day) ? "text-primary" : "text-foreground"
                              }`}
                            >
                              {day}
                            </span>
                            {hasServices && (
                              <Badge
                                variant="secondary"
                                className="h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs"
                              >
                                {dayServices.length}
                              </Badge>
                            )}
                          </div>
                          <div className="flex-1 overflow-hidden">
                            {dayServices.slice(0, 2).map((service, idx) => (
                              <div
                                key={idx}
                                className="text-xs truncate text-muted-foreground mb-0.5"
                              >
                                • {getServiceTypeLabel(service.serviceType)}
                              </div>
                            ))}
                            {dayServices.length > 2 && (
                              <div className="text-xs text-muted-foreground">
                                +{dayServices.length - 2} más
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Renewals List */}
      <Card className="glass border-2">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">
            Renovaciones del Mes
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Servicios que vencen en {monthName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {services
                ?.filter((service) => {
                  if (filterType !== "all" && service.serviceType !== filterType) {
                    return false;
                  }
                  const renewalDate = new Date(service.renewalDate);
                  return (
                    renewalDate.getMonth() === currentDate.getMonth() &&
                    renewalDate.getFullYear() === currentDate.getFullYear()
                  );
                })
                .sort((a, b) => new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime())
                .map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between p-4 rounded-2xl glass-light hover:bg-accent/10 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="rounded-full">
                          {getServiceTypeLabel(service.serviceType)}
                        </Badge>
                        <div>
                          <p className="font-medium text-foreground">{service.serviceName}</p>
                          <p className="text-sm text-muted-foreground">
                            {getClientName(service.clientId)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {formatCurrency(service.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(service.renewalDate).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                  </div>
                )) || []}
              {services?.filter((service) => {
                if (filterType !== "all" && service.serviceType !== filterType) {
                  return false;
                }
                const renewalDate = new Date(service.renewalDate);
                return (
                  renewalDate.getMonth() === currentDate.getMonth() &&
                  renewalDate.getFullYear() === currentDate.getFullYear()
                );
              }).length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    No hay renovaciones programadas para este mes
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
