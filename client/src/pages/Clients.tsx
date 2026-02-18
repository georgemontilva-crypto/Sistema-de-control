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
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Building2, Mail, Phone, Plus, Search, Trash2, UserCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
import { useLocation } from "wouter";

export default function Clients() {
  const [, navigate] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteClientId, setDeleteClientId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    document: "",
    phone: "",
    email: "",
    address: "",
    contactPerson: "",
    notes: "",
  });

  const { data: clients, isLoading } = trpc.clients.list.useQuery();
  const utils = trpc.useUtils();
  
  const createClient = trpc.clients.create.useMutation({
    onSuccess: () => {
      toast.success("Cliente creado exitosamente");
      setIsDialogOpen(false);
      setFormData({
        name: "",
        document: "",
        phone: "",
        email: "",
        address: "",
        contactPerson: "",
        notes: "",
      });
      utils.clients.list.invalidate();
    },
    onError: (error) => {
      toast.error("Error al crear cliente: " + error.message);
    },
  });

  const deleteClient = trpc.clients.delete.useMutation({
    onSuccess: () => {
      toast.success("Cliente eliminado exitosamente");
      setDeleteClientId(null);
      utils.clients.list.invalidate();
    },
    onError: (error) => {
      toast.error("Error al eliminar cliente: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("El nombre del cliente es requerido");
      return;
    }
    createClient.mutate(formData);
  };

  const filteredClients = clients?.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.document?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Clientes</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona la información de tus clientes
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="glass max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-foreground">Crear Nuevo Cliente</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Ingresa la información del cliente
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-foreground">
                      Nombre / Empresa *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nombre del cliente"
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="document" className="text-foreground">
                      Documento / NIT
                    </Label>
                    <Input
                      id="document"
                      value={formData.document}
                      onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                      placeholder="Número de documento"
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-foreground">
                      Teléfono
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 234 567 8900"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">
                      Correo Electrónico
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="cliente@ejemplo.com"
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPerson" className="text-foreground">
                    Persona de Contacto
                  </Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="Nombre del responsable"
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-foreground">
                    Dirección
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Dirección completa"
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-foreground">
                    Notas / Observaciones
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Información adicional sobre el cliente"
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
                <Button type="submit" disabled={createClient.isPending} className="rounded-xl">
                  {createClient.isPending ? "Creando..." : "Crear Cliente"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <Card className="glass border-2">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, email o documento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients List */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="glass">
              <CardHeader>
                <div className="h-6 w-32 bg-muted animate-pulse rounded" />
                <div className="h-4 w-24 bg-muted animate-pulse rounded mt-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-muted animate-pulse rounded" />
                  <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredClients && filteredClients.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => (
            <Card
              key={client.id}
              className="glass border-2 hover:border-primary/50 transition-all duration-300 cursor-pointer group"
              onClick={() => navigate(`/clients/${client.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-foreground group-hover:text-primary transition-colors">
                        {client.name}
                      </CardTitle>
                      {client.document && (
                        <CardDescription className="text-xs text-muted-foreground">
                          {client.document}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteClientId(client.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {client.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{client.phone}</span>
                  </div>
                )}
                {client.contactPerson && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <UserCircle className="h-4 w-4" />
                    <span className="truncate">{client.contactPerson}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="glass border-2">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground">No se encontraron clientes</p>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery
                ? "Intenta con otros términos de búsqueda"
                : "Comienza agregando tu primer cliente"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteClientId !== null} onOpenChange={() => setDeleteClientId(null)}>
        <AlertDialogContent className="glass">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Esta acción eliminará el cliente y toda su información asociada. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteClientId && deleteClient.mutate({ id: deleteClientId })}
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
