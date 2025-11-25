"use client"

import { cn } from "@/lib/utils"
import * as React from "react"

interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{
    name?: string
    value?: number | string
    dataKey?: string
    color?: string
    payload?: Record<string, unknown>
  }>
  label?: string
  formatter?: (value: number | string, name: string) => React.ReactNode
  labelFormatter?: (label: string) => React.ReactNode
  indicator?: "line" | "dot" | "dashed"
}

export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
  indicator = "dot",
}: ChartTooltipProps) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="min-w-[8rem] items-start gap-1.5 border-border/50 bg-background/95 backdrop-blur rounded-lg border p-2 shadow-sm">
      {label && (
        <div className="grid gap-1.5">
          <div className="font-medium leading-none tracking-tight">
            {labelFormatter
              ? labelFormatter(label)
              : label}
          </div>
        </div>
      )}
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const key = `${item.dataKey || item.name || "value"}-${index}`
          const itemConfig = item.payload?.config as
            | {
              [key: string]: {
                label?: React.ReactNode
                icon?: React.ComponentType
              }
            }
            | undefined

          const dataKey = item.dataKey || item.name || "value"
          const name =
            (itemConfig?.[dataKey]?.label as string) ||
            item.name ||
            dataKey
          const value = item.value

          return (
            <div
              key={key}
              className="flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground"
            >
              {indicator === "dot" && (
                <div
                  className="shrink-0 rounded-[2px] border-[--color] bg-[--color]"
                  style={
                    {
                      "--color": item.color,
                    } as React.CSSProperties
                  }
                />
              )}
              {indicator === "dashed" && (
                <div
                  className="shrink-0 border-[--color]"
                  style={
                    {
                      "--color": item.color,
                    } as React.CSSProperties
                  }
                />
              )}
              {indicator === "line" && (
                <div
                  className="shrink-0 border-[--color]"
                  style={
                    {
                      "--color": item.color,
                    } as React.CSSProperties
                  }
                />
              )}
              <div
                className={cn(
                  "flex flex-1 justify-between leading-none",
                  label && "gap-2"
                )}
              >
                <div className="grid gap-1.5">
                  <span className="text-muted-foreground">{name}</span>
                </div>
                {formatter && typeof value !== "undefined" ? (
                  <span className="font-mono font-medium tabular-nums text-foreground">
                    {formatter(value, name)}
                  </span>
                ) : (
                  <span className="font-mono font-medium tabular-nums text-foreground">
                    {value}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

