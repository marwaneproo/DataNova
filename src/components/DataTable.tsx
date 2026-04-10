import { useState } from "react";
import { CSVData } from "@/lib/csv-utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DataTableProps {
  data: CSVData;
}

const PAGE_SIZE = 15;

const DataTable = ({ data }: DataTableProps) => {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(data.rows.length / PAGE_SIZE);
  const visibleRows = data.rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="glass rounded-xl overflow-hidden animate-fade-in">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">#</th>
              {data.headers.map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, i) => (
              <tr key={i} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-2.5 text-muted-foreground font-mono text-xs">{page * PAGE_SIZE + i + 1}</td>
                {data.headers.map((h) => (
                  <td key={h} className="px-4 py-2.5 text-foreground whitespace-nowrap max-w-[200px] truncate">
                    {row[h] || <span className="text-muted-foreground/50 italic">vide</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
          <span className="text-xs text-muted-foreground">
            Page {page + 1} / {totalPages} • {data.rows.length} lignes
          </span>
          <div className="flex gap-1">
            <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="p-1.5 rounded-lg hover:bg-secondary disabled:opacity-30 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="p-1.5 rounded-lg hover:bg-secondary disabled:opacity-30 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
