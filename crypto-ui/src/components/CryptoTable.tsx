import { useState } from 'react';
import { 
  flexRender,
  getCoreRowModel, 
  useReactTable, 
  getSortedRowModel,
  SortingState,
  getPaginationRowModel,
  getFilteredRowModel,
  ColumnDef
} from '@tanstack/react-table';
import { CryptoData } from '../types/crypto';

interface CryptoTableProps {
  data: CryptoData[];
  isLoading: boolean;
}

export default function CryptoTable({ data, isLoading }: CryptoTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'market_cap_rank', desc: false }
  ]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns: ColumnDef<CryptoData>[] = [
    {
      accessorKey: 'market_cap_rank',
      header: 'Rank',
      cell: info => info.getValue(),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: info => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{info.getValue() as string}</span>
          <span className="text-gray-500">({info.row.original.symbol})</span>
        </div>
      ),
    },
    {
      accessorKey: 'price',
      header: 'Price (USD)',
      cell: info => {
        const price = info.getValue() as number;
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: price < 1 ? 6 : 2,
          maximumFractionDigits: price < 1 ? 6 : 2,
        }).format(price);
      },
    },
    {
      accessorKey: 'price_change_percentage_24h',
      header: '24h %',
      cell: info => {
        const value = info.getValue() as number;
        const isPositive = value >= 0;
        return (
          <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
            {isPositive ? '+' : ''}{value.toFixed(2)}%
          </span>
        );
      },
    },
    {
      accessorKey: 'market_cap',
      header: 'Market Cap',
      cell: info => {
        const value = info.getValue() as number;
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          notation: 'compact',
          maximumFractionDigits: 2,
        }).format(value);
      },
    },
    {
      accessorKey: 'total_volume',
      header: 'Volume (24h)',
      cell: info => {
        const value = info.getValue() as number;
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          notation: 'compact',
          maximumFractionDigits: 2,
        }).format(value);
      },
    },
    {
      accessorKey: 'high_24h',
      header: '24h High',
      cell: info => {
        const value = info.getValue() as number;
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: value < 1 ? 6 : 2,
          maximumFractionDigits: value < 1 ? 6 : 2,
        }).format(value);
      },
    },
    {
      accessorKey: 'low_24h',
      header: '24h Low',
      cell: info => {
        const value = info.getValue() as number;
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: value < 1 ? 6 : 2,
          maximumFractionDigits: value < 1 ? 6 : 2,
        }).format(value);
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 25,
      },
    },
  });

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Cryptocurrency Market</h2>
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Search coins..."
            className="px-3 py-2 border rounded-md"
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th 
                    key={header.id}
                    className="px-4 py-3 text-left font-medium"
                    onClick={header.column.getToggleSortingHandler()}
                    style={{ cursor: 'pointer' }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {{
                      asc: ' 🔼',
                      desc: ' 🔽',
                    }[header.column.getIsSorted() as string] ?? null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-4">
                  Loading data...
                </td>
              </tr>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map(row => (
                <tr 
                  key={row.id}
                  className="border-t border-gray-200 hover:bg-gray-50"
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-4">
                  No results found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 border rounded-md disabled:opacity-50"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            {'<<'}
          </button>
          <button
            className="px-3 py-1 border rounded-md disabled:opacity-50"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {'<'}
          </button>
          <button
            className="px-3 py-1 border rounded-md disabled:opacity-50"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {'>'}
          </button>
          <button
            className="px-3 py-1 border rounded-md disabled:opacity-50"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            {'>>'}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span>
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={e => {
              table.setPageSize(Number(e.target.value));
            }}
            className="px-2 py-1 border rounded-md"
          >
            {[10, 25, 50, 100].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
