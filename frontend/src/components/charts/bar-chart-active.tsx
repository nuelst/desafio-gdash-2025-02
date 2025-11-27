import * as React from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts"
import { ChartConfig } from "./chart-config"
import { ChartContainer } from "./chart-container"

interface BarChartActiveProps {
  data: Array<Record<string, unknown>>
  config: ChartConfig
  height?: number
  className?: string
}

export function BarChartActive({
  data,
  config,
  height = 300,
  className,
}: BarChartActiveProps) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null)
  const keys = Object.keys(config)

  return (
    <ChartContainer config={config} data={data} nameKey="time" className={className}>
      {({ colors, rechartsData }) => (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            accessibilityLayer
            data={rechartsData}
            onMouseMove={(state) => {
              if (state.isTooltipActive) {
                setActiveIndex(state.activeTooltipIndex ?? null)
              } else {
                setActiveIndex(null)
              }
            }}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value}
            />
            <Tooltip content={<ChartTooltipContent />} />
            {keys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index]}
                radius={4}
                opacity={activeIndex !== null ? (activeIndex === index ? 1 : 0.5) : 1}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartContainer>
  )
}

function ChartTooltipContent({ active, payload }: any) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      <div className="grid gap-2">
        {payload.map((item: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-muted-foreground">{item.name}</span>
            </div>
            <span className="font-medium tabular-nums">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

