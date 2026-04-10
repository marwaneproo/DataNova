import { ColumnStats } from "@/lib/csv-utils";
import { Hash, Tag, Calendar, FileText } from "lucide-react";

interface StatsCardsProps {
  stats: ColumnStats[];
}

const typeIcons = {
  numeric: Hash,
  categorical: Tag,
  date: Calendar,
  text: FileText,
};

const typeColors = {
  numeric: "text-primary",
  categorical: "text-accent",
  date: "text-warning",
  text: "text-muted-foreground",
};

const StatsCards = ({ stats }: StatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {stats.map((col, i) => {
        const Icon = typeIcons[col.type];
        return (
          <div key={i} className="glass rounded-xl p-4 animate-slide-up hover:glow-sm transition-all" style={{ animationDelay: `${i * 0.03}s` }}>
            <div className="flex items-center gap-2 mb-3">
              <Icon className={`w-4 h-4 ${typeColors[col.type]}`} />
              <h4 className="font-semibold text-foreground text-sm truncate">{col.name}</h4>
              <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                {col.type}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Valeurs</span>
                <p className="font-medium text-foreground">{col.count - col.missing}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Manquants</span>
                <p className={`font-medium ${col.missing > 0 ? "text-warning" : "text-success"}`}>
                  {col.missingPct}%
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Uniques</span>
                <p className="font-medium text-foreground">{col.unique}</p>
              </div>
              {col.type === "numeric" && (
                <div>
                  <span className="text-muted-foreground">Moyenne</span>
                  <p className="font-medium text-primary">{col.mean}</p>
                </div>
              )}
            </div>
            {col.type === "numeric" && (
              <div className="mt-3 pt-3 border-t border-border/30 flex justify-between text-xs">
                <span className="text-muted-foreground">Min: <span className="text-foreground">{col.min}</span></span>
                <span className="text-muted-foreground">Médiane: <span className="text-foreground">{col.median}</span></span>
                <span className="text-muted-foreground">Max: <span className="text-foreground">{col.max}</span></span>
              </div>
            )}
            {col.topValues && (
              <div className="mt-3 pt-3 border-t border-border/30">
                <p className="text-xs text-muted-foreground mb-1">Top valeurs</p>
                <div className="flex flex-wrap gap-1">
                  {col.topValues.slice(0, 3).map((v, j) => (
                    <span key={j} className="text-[10px] bg-accent/20 text-accent-foreground px-2 py-0.5 rounded-full">
                      {v.value} ({v.count})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
