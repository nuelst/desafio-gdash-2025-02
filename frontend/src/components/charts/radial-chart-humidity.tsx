"use client"

import { Label, PolarRadiusAxis, RadialBar, RadialBarChart, ResponsiveContainer, Tooltip } from "recharts"
import { ChartConfig } from "./chart-config"
import { ChartContainer } from "./chart-container"
import { ChartTooltip } from "./chart-tooltip"

interface RadialChartHumidityProps {
  humidity: number // Porcentagem de umidade (0-100)
  height?: number
  className?: string
}

const chartConfig = {
  humidity: {
    label: "Umidade",
    color: "#3b82f6",
  },
} satisfies ChartConfig

export function RadialChartHumidity({
  humidity,
  height = 300,
  className,
}: RadialChartHumidityProps) {
  const normalizedHumidity = Math.max(0, Math.min(100, humidity))

  const remaining = 100 - normalizedHumidity

  const chartData = [
    {
      humidity: normalizedHumidity,
      remaining: remaining
    }
  ]

  return (
    <ChartContainer
      config={chartConfig}
      data={chartData}
      className={className}
    >
      {({ colors }) => (
        <ResponsiveContainer width="100%" height={height}>
          <RadialBarChart
            data={chartData}
            endAngle={180}
            innerRadius={80}
            outerRadius={130}
          >
            <Tooltip
              cursor={false}
              content={<ChartTooltip />}
            />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 16}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {normalizedHumidity.toFixed(1)}%
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 4}
                          className="fill-muted-foreground text-sm"
                        >
                          Umidade
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
            <RadialBar
              dataKey="humidity"
              stackId="a"
              cornerRadius={5}
              fill={colors[0]}
              className="stroke-transparent stroke-2"
            />
            <RadialBar
              dataKey="remaining"
              fill={colors[0]}
              fillOpacity={0.2}
              stackId="a"
              cornerRadius={5}
              className="stroke-transparent stroke-2"
            />
          </RadialBarChart>
        </ResponsiveContainer>
      )}
    </ChartContainer>
  )
}

