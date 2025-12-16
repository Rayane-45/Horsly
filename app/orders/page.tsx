import { AppHeader } from "@/components/app-header"
import { TabBar } from "@/components/tab-bar"
import { AddOrderDialog } from "@/components/add-order-dialog"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Package,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  RotateCcw,
  ChevronRight,
} from "lucide-react"

export default function OrdersPage() {
  const activeOrders = [
    {
      id: 1,
      supplier: "Agri Supply",
      product: "Foin premium",
      quantity: "50 balles",
      cost: 450,
      orderDate: "5 Juin 2024",
      deliveryDate: "15 Juin 2024",
      status: "in-transit",
      frequency: "Mensuelle",
    },
    {
      id: 2,
      supplier: "Horse Feed Pro",
      product: "Granulés performance",
      quantity: "3 sacs (25kg)",
      cost: 120,
      orderDate: "8 Juin 2024",
      deliveryDate: "12 Juin 2024",
      status: "pending",
      frequency: "Ponctuelle",
    },
  ]

  const completedOrders = [
    {
      id: 3,
      supplier: "Stable Supplies",
      product: "Litière copeaux",
      quantity: "10 sacs",
      cost: 85,
      orderDate: "1 Juin 2024",
      deliveryDate: "3 Juin 2024",
      completedDate: "3 Juin 2024",
      status: "delivered",
    },
    {
      id: 4,
      supplier: "Equi Store",
      product: "Compléments alimentaires",
      quantity: "2 unités",
      cost: 65,
      orderDate: "28 Mai 2024",
      deliveryDate: "30 Mai 2024",
      completedDate: "30 Mai 2024",
      status: "delivered",
    },
  ]

  const recurringOrders = [
    {
      id: 1,
      supplier: "Agri Supply",
      product: "Foin premium",
      quantity: "50 balles",
      cost: 450,
      frequency: "Mensuelle",
      nextOrder: "1 Juillet 2024",
      lastOrder: "1 Juin 2024",
    },
    {
      id: 2,
      supplier: "Horse Feed Pro",
      product: "Granulés performance",
      quantity: "3 sacs (25kg)",
      cost: 120,
      frequency: "Toutes les 2 semaines",
      nextOrder: "20 Juin 2024",
      lastOrder: "6 Juin 2024",
    },
    {
      id: 3,
      supplier: "Stable Supplies",
      product: "Litière copeaux",
      quantity: "10 sacs",
      cost: 85,
      frequency: "Mensuelle",
      nextOrder: "1 Juillet 2024",
      lastOrder: "1 Juin 2024",
    },
  ]

  const suppliers = [
    { name: "Agri Supply", orders: 12, totalSpent: 5400 },
    { name: "Horse Feed Pro", orders: 8, totalSpent: 960 },
    { name: "Stable Supplies", orders: 6, totalSpent: 510 },
    { name: "Equi Store", orders: 4, totalSpent: 260 },
  ]

  const monthlyStats = {
    totalOrders: 8,
    totalSpent: 1245,
    pendingOrders: 2,
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-muted">
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        )
      case "in-transit":
        return (
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            <Truck className="h-3 w-3 mr-1" />
            En transit
          </Badge>
        )
      case "delivered":
        return (
          <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Livré
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen pb-20 bg-background">
      <AppHeader title="Commandes" />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 bg-card border border-border text-center">
            <Package className="h-5 w-5 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{monthlyStats.totalOrders}</p>
            <p className="text-xs text-muted-foreground">Ce mois</p>
          </Card>

          <Card className="p-4 bg-card border border-border text-center">
            <TrendingUp className="h-5 w-5 text-secondary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{monthlyStats.totalSpent}€</p>
            <p className="text-xs text-muted-foreground">Dépensé</p>
          </Card>

          <Card className="p-4 bg-card border border-border text-center">
            <Clock className="h-5 w-5 text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{monthlyStats.pendingOrders}</p>
            <p className="text-xs text-muted-foreground">En cours</p>
          </Card>
        </div>

        <AddOrderDialog />

        {/* Tabs */}
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList className="w-full grid grid-cols-3 bg-muted/50">
            <TabsTrigger value="active">En cours</TabsTrigger>
            <TabsTrigger value="recurring">Récurrentes</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
          </TabsList>

          {/* Active Orders */}
          <TabsContent value="active" className="space-y-3">
            {activeOrders.length > 0 ? (
              activeOrders.map((order) => (
                <Card
                  key={order.id}
                  className="p-4 bg-card border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">{order.product}</h3>
                      <p className="text-sm text-muted-foreground">{order.supplier}</p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Quantité</span>
                      <span className="text-foreground font-medium">{order.quantity}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Coût</span>
                      <span className="text-foreground font-semibold">{order.cost}€</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-3 border-t border-border">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Commande: {order.orderDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Truck className="h-3 w-3" />
                      Livraison: {order.deliveryDate}
                    </span>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-8 bg-card border border-border text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-foreground font-medium mb-1">Aucune commande en cours</p>
                <p className="text-sm text-muted-foreground">Créez votre première commande</p>
              </Card>
            )}
          </TabsContent>

          {/* Recurring Orders */}
          <TabsContent value="recurring" className="space-y-3">
            <Card className="p-4 bg-accent/5 border border-accent/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Rappels automatiques activés</p>
                  <p className="text-xs text-muted-foreground">
                    Vous recevrez une notification avant chaque renouvellement
                  </p>
                </div>
              </div>
            </Card>

            {recurringOrders.map((order) => (
              <Card key={order.id} className="p-4 bg-card border border-border">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{order.product}</h3>
                    <p className="text-sm text-muted-foreground">{order.supplier}</p>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    <RotateCcw className="h-3 w-3 mr-1" />
                    {order.frequency}
                  </Badge>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Quantité</span>
                    <span className="text-foreground font-medium">{order.quantity}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Coût</span>
                    <span className="text-foreground font-semibold">{order.cost}€</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="text-xs text-muted-foreground">
                    <p>Dernière: {order.lastOrder}</p>
                    <p className="text-foreground font-medium mt-1">Prochaine: {order.nextOrder}</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-border bg-transparent hover:bg-accent">
                    Commander
                  </Button>
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* History */}
          <TabsContent value="history" className="space-y-4">
            {/* Suppliers Summary */}
            <Card className="p-4 bg-card border border-border">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                Fournisseurs principaux
              </h3>
              <div className="space-y-2">
                {suppliers.map((supplier, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-accent/5 border border-accent/10 hover:bg-accent/10 transition-colors cursor-pointer"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{supplier.name}</p>
                      <p className="text-xs text-muted-foreground">{supplier.orders} commandes</p>
                    </div>
                    <div className="text-right mr-2">
                      <p className="font-semibold text-foreground">{supplier.totalSpent}€</p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </Card>

            {/* Completed Orders */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Commandes récentes</h3>
              {completedOrders.map((order) => (
                <Card key={order.id} className="p-4 bg-card border border-border">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">{order.product}</h3>
                      <p className="text-sm text-muted-foreground">{order.supplier}</p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Quantité</span>
                      <span className="text-foreground font-medium">{order.quantity}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Coût</span>
                      <span className="text-foreground font-semibold">{order.cost}€</span>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground pt-3 border-t border-border">
                    <p>Livré le {order.completedDate}</p>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <TabBar />
    </div>
  )
}
