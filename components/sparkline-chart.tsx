"use client"

import { Line, LineChart, ResponsiveContainer } from "recharts"

interface SparklineChartProps {
  data: number[]
  color?: string
}

export function SparklineChart({ data, color = "#3A7A57" }: SparklineChartProps) {
  const chartData = data.map((value, index) => ({
    index,
    value,
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
