import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ChartConfig } from "./chart-config"
import { ChartContainer } from "./chart-container"

interface AreaChartLegendProps {
  data: Array<Record<string, unknown>>
  config: ChartConfig
  height?: number
  className?: string
}

export function AreaChartLegend({
  data,
  config,
  height = 300,
  className,
}: AreaChartLegendProps) {
  const keys = Object.keys(config)

  return (
    <ChartContainer config={config} data={data} nameKey="time" className={className}>
      {({ colors, rechartsData }) => (
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart
            accessibilityLayer
            data={rechartsData}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="circle"
              content={<ChartLegendContent />}
            />
            {keys.map((key, index) => (
              <Area
                key={key}
                dataKey={key}
                type="monotone"
                fill={colors[index]}
                fillOpacity={0.2}
                stroke={colors[index]}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
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

function ChartLegendContent({ payload }: any) {
  if (!payload?.length) {
    return null
  }

  return (
    <div className="flex items-center justify-center gap-4">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

