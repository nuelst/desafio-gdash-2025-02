"use client"

import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCondition, formatDateTime } from "@/core/utils"
import type { WeatherLog } from "@/core/validation"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import * as React from "react"
import { DataTableColumnHeader } from "../users/data-table-column-header"
import { DataTablePagination } from "../users/data-table-pagination"
import { DataTableViewOptions } from "../users/data-table-view-options"

interface WeatherLogsDataTableProps {
  data: WeatherLog[]
  total: number
  page: number
  limit: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  onLocationFilterChange: (location: string) => void
  locationFilter?: string
}

export function WeatherLogsDataTable({
  data,
  total,
  page,
  limit,
  onPageChange,
  onPageSizeChange,
  onLocationFilterChange,
  locationFilter = "",
}: WeatherLogsDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [locationInput, setLocationInput] = React.useState(locationFilter || "")

  // Sincronizar locationInput com locationFilter quando mudar externamente
  React.useEffect(() => {
    setLocationInput(locationFilter || "")
  }, [locationFilter])

  // Debounce para o filtro de localização
  React.useEffect(() => {
    // Não fazer requisição na montagem inicial se já estiver vazio
    const timer = setTimeout(() => {
      onLocationFilterChange(locationInput)
    }, 500) // 500ms de debounce

    return () => clearTimeout(timer)
  }, [locationInput, onLocationFilterChange])

  const columns: ColumnDef<WeatherLog>[] = React.useMemo(
    () => [
      {
        accessorKey: "timestamp",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Data/Hora" />
        ),
        cell: ({ row }) => {
          const timestamp = row.getValue("timestamp") as string
          return <div className="font-medium">{formatDateTime(timestamp)}</div>
        },
      },
      {
        accessorKey: "location",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Local" />
        ),
        cell: ({ row }) => (
          <div>{row.getValue("location")}</div>
        ),
      },
      {
        accessorKey: "temperature",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Temperatura" />
        ),
        cell: ({ row }) => {
          const temp = parseFloat(row.getValue("temperature"))
          return <div>{temp.toFixed(1)}°C</div>
        },
      },
      {
        accessorKey: "humidity",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Umidade" />
        ),
        cell: ({ row }) => {
          const humidity = parseFloat(row.getValue("humidity"))
          return <div>{humidity.toFixed(1)}%</div>
        },
      },
      {
        accessorKey: "windSpeed",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Vento" />
        ),
        cell: ({ row }) => {
          const windSpeed = parseFloat(row.getValue("windSpeed"))
          return <div>{windSpeed.toFixed(1)} km/h</div>
        },
      },
      {
        accessorKey: "condition",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Condição" />
        ),
        cell: ({ row }) => {
          const condition = row.getValue("condition") as string
          return <div>{formatCondition(condition)}</div>
        },
      },
      {
        accessorKey: "precipitationProbability",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Prob. Chuva" />
        ),
        cell: ({ row }) => {
          const prob = row.getValue("precipitationProbability") as number | undefined
          if (prob === undefined || prob === null) {
            return <div className="text-muted-foreground">-</div>
          }
          return <div>{prob.toFixed(0)}%</div>
        },
      },
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(total / limit),
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    manualPagination: true, // Paginação no servidor
    manualSorting: true, // Ordenação no servidor (se implementado)
    state: {
      sorting,
      columnVisibility,
      pagination: {
        pageIndex: page - 1, // TanStack usa índice baseado em 0
        pageSize: limit,
      },
    },
    initialState: {
      sorting: [
        {
          id: "timestamp",
          desc: true, // Mais recentes primeiro
        },
      ],
    },
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === "function"
          ? updater({ pageIndex: page - 1, pageSize: limit })
          : updater
      if (newPagination.pageIndex !== page - 1) {
        onPageChange(newPagination.pageIndex + 1)
      }
      if (newPagination.pageSize !== limit) {
        onPageSizeChange(newPagination.pageSize)
      }
    },
  })

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filtrar por localização..."
          value={locationInput}
          onChange={(event) => setLocationInput(event.target.value)}
          className="max-w-sm"
        />
        <DataTableViewOptions table={table} />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4">
        <DataTablePagination table={table} />
      </div>
    </div>
  )
}

