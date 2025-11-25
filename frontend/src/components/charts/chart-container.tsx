
import { cn } from "@/lib/utils"
import * as React from "react"

interface ChartContainerProps {
  config: {
    [key: string]: {
      label?: React.ReactNode
      icon?: React.ComponentType
    } & (
      | { color?: string; theme?: never }
      | { color?: never; theme: Record<string, string> }
    )
  }
  children: (props: {
    colors: string[]
    keys: string[]
    rechartsData: Array<Record<string, unknown>>
  }) => React.ReactNode
  data: unknown[]
  nameKey?: string
  className?: string
}

export function ChartContainer({
  config,
  data,
  nameKey: _nameKey,
  children,
  className,
  ...props
}: ChartContainerProps) {
  const keys = Object.keys(config)
  const colors = keys.map((key) => {
    const configEntry = config[key]
    if (configEntry.theme) {
      return configEntry.theme[keys.indexOf(key)] || configEntry.theme.default
    }
    const defaultColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']
    return configEntry.color || defaultColors[keys.indexOf(key) % defaultColors.length]
  })

  const rechartsData = React.useMemo(() => {
    return data.map((item) => {
      const newItem: Record<string, unknown> = {}
      if (item && typeof item === "object") {
        Object.entries(item).forEach(([key, value]) => {
          newItem[key] = value
        })
      }
      return newItem
    })
  }, [data])

  return (
    <div className={cn("w-full", className)} {...props}>
      {children({ colors, keys, rechartsData })}
    </div>
  )
}

