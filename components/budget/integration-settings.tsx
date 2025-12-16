"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Heart, Activity, RefreshCw, Link2, CheckCircle2, AlertCircle } from "lucide-react"

export function IntegrationSettings() {
  const [healthSync, setHealthSync] = useState(true)
  const [trainingSync, setTrainingSync] = useState(true)
  const [autoCreateOperations, setAutoCreateOperations] = useState(true)

  const integrations = [
    {
      id: "health",
      name: "Module Santé",
      icon: Heart,
      enabled: healthSync,
      setEnabled: setHealthSync,
      status: "connected",
      lastSync: "Il y a 2 heures",
      operationsCreated: 12,
      description: "Synchronise automatiquement les frais vétérinaires et de santé",
    },
    {
      id: "training",
      name: "Module Entraînement",
      icon: Activity,
      enabled: trainingSync,
      setEnabled: setTrainingSync,
      status: "connected",
      lastSync: "Il y a 5 heures",
      operationsCreated: 8,
      description: "Synchronise les frais de cours, stages et compétitions",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Intégrations</h3>
        <p className="text-sm text-muted-foreground">Connectez le budget avec les modules Santé et Entraînement</p>
      </div>

      {/* Global Settings */}
      <Card className="p-4 bg-card border-border">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-create" className="text-foreground font-medium">
              Création automatique d'opérations
            </Label>
            <p className="text-xs text-muted-foreground">
              Créer automatiquement des opérations budgétaires depuis les modules
            </p>
          </div>
          <Switch id="auto-create" checked={autoCreateOperations} onCheckedChange={setAutoCreateOperations} />
        </div>
      </Card>

      {/* Integration Cards */}
      <div className="space-y-4">
        {integrations.map((integration) => {
          const Icon = integration.icon
          const isConnected = integration.status === "connected"

          return (
            <Card key={integration.id} className="p-6 bg-card border-border">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-foreground">{integration.name}</h4>
                        {isConnected ? (
                          <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Connecté
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-muted-foreground/20 text-muted-foreground">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Déconnecté
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{integration.description}</p>
                    </div>
                  </div>

                  <Switch
                    checked={integration.enabled}
                    onCheckedChange={integration.setEnabled}
                    disabled={!isConnected}
                  />
                </div>

                {isConnected && integration.enabled && (
                  <>
                    <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-accent/5 border border-accent/10">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Dernière synchronisation</p>
                        <p className="text-sm font-medium text-foreground">{integration.lastSync}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Opérations créées</p>
                        <p className="text-sm font-medium text-foreground">{integration.operationsCreated}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="border-border bg-transparent">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Synchroniser maintenant
                      </Button>
                      <Button variant="outline" size="sm" className="border-border bg-transparent">
                        <Link2 className="h-3 w-3 mr-1" />
                        Voir les opérations liées
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Webhook Configuration */}
      <Card className="p-6 bg-card border-border">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-foreground mb-1">Configuration Webhooks</h4>
            <p className="text-sm text-muted-foreground">Les webhooks permettent une synchronisation en temps réel</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/5 border border-accent/10">
              <div>
                <p className="text-sm font-medium text-foreground">Webhook Santé</p>
                <p className="text-xs text-muted-foreground font-mono">/api/webhooks/health</p>
              </div>
              <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20">
                Actif
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/5 border border-accent/10">
              <div>
                <p className="text-sm font-medium text-foreground">Webhook Entraînement</p>
                <p className="text-xs text-muted-foreground font-mono">/api/webhooks/training</p>
              </div>
              <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20">
                Actif
              </Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
