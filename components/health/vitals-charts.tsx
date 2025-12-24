"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useHealthStore } from "@/lib/health/store"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface VitalsChartsProps {
  horseId: string
}

export function VitalsCharts({ horseId }: VitalsChartsProps) {
  const { vitalSigns } = useHealthStore()

  const horseVitals = vitalSigns
    .filter((v) => v.horseId === horseId)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30) // Last 30 entries

  const weightData = horseVitals
    .filter((v) => v.weightKg !== undefined)
    .map((v) => ({
      date: new Date(v.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
      poids: v.weightKg,
    }))

  const tempData = horseVitals
    .filter((v) => v.temperatureC !== undefined)
    .map((v) => ({
      date: new Date(v.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
      temperature: v.temperatureC,
    }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Évolution du poids</CardTitle>
        </CardHeader>
        <CardContent>
          {weightData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis domain={["dataMin - 10", "dataMax + 10"]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="poids" stroke="hsl(var(--primary))" strokeWidth={2} name="Poids (kg)" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              Aucune donnée de poids
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Évolution de la température</CardTitle>
        </CardHeader>
        <CardContent>
          {tempData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={tempData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis domain={[36, 40]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="hsl(var(--destructive))"
                  strokeWidth={2}
                  name="Température (°C)"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              Aucune donnée de température
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
