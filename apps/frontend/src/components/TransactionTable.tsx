"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpcReact } from "@/utils/react";
import { trpc } from "@/utils/server-client";
import { inferAsyncReturnType } from "@trpc/server";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

// Define the raw data type first
type ReceivedTransaction = inferAsyncReturnType<
  typeof trpc.transaction.getAllForAsset.query
>[number];

// Define your desired transaction type
type Transaction = Omit<ReceivedTransaction, "details"> & {
  details: {
    transferDate: string;
    assetName: string;
  };
};

export function TransactionTable({
  assetId,
  initialData,
}: {
  assetId: string;
  initialData: inferAsyncReturnType<
    typeof trpc.transaction.getAllForAsset.query
  >;
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [filterColumn, setFilterColumn] = React.useState<string>("fromUser"); // State to manage selected column for filtering

  const { data: rawData } = trpcReact.transaction.getAllForAsset.useQuery(
    { assetId },
    { initialData }
  );

  // Now TypeScript knows the shape of both types
  const data = React.useMemo(() => {
    return rawData.map((item) => ({
      ...item,
      details: {
        transferDate:
          (item.details as { transferDate: string; assetName: string })
            ?.transferDate ?? "",
        assetName:
          (item.details as { transferDate: string; assetName: string })
            ?.assetName ?? "",
      },
    })) as Transaction[];
  }, [rawData]);

  const columns: ColumnDef<Transaction>[] = React.useMemo(
    () => [
      {
        accessorKey: "transactionId",
        header: () => <div className="min-w-32">Transaction Id</div>,
        cell: ({ row }) => <div className="min-w-32">{row.original.id}</div>,
      },
      {
        accessorKey: "details_assetName",
        header: () => <div className="min-w-32">Asset Name</div>,
        cell: ({ row }) => (
          <div className="min-w-32">{row.original.details?.assetName}</div>
        ),
      },
      {
        accessorKey: "fromUser",
        header: () => <div className="min-w-32">From User</div>,
        cell: ({ row }) => (
          <div className="min-w-32">{row.original.fromUser?.id ?? "N/A"}</div>
        ),
      },
      {
        accessorKey: "toUser",
        header: () => <div className="min-w-32">To User</div>,
        cell: ({ row }) => (
          <div className="min-w-32">{row.original.toUser?.id ?? "N/A"}</div>
        ),
      },
      {
        accessorKey: "transactionDate",
        header: ({ column }) => (
          <Button
            className="min-w-32 w-fit"
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Transaction Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="min-w-32">
            {new Date(row.original.transactionDate).toLocaleString()}
          </div>
        ),
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const transaction = row.original;

          return (
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => {
                      navigator.clipboard.writeText(transaction.id);
                      toast.success("Transaction ID Copied", {
                        description: `Transaction ID ${transaction.id} has been copied to clipboard.`,
                      });
                    }}
                  >
                    Copy transaction ID
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    []
  );
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center py-4 gap-4">
        {/* Column Filter Select */}
        <Select
          value={filterColumn}
          onValueChange={(value) => setFilterColumn(value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select column to filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fromUser">From User</SelectItem>
            <SelectItem value="toUser">To User</SelectItem>
            <SelectItem value="transactionDate">Transaction Date</SelectItem>
          </SelectContent>
        </Select>

        {/* Filter Input */}
        <Input
          placeholder={`Filter by ${filterColumn}...`}
          value={
            (table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn(filterColumn)?.setFilterValue(event.target.value)
          }
          className="max-w-xs md:max-w-sm"
        />
      </div>
      <div className="rounded-md border max-w-[22rem] md:max-w-full">
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
                  );
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
