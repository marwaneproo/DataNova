import { useState } from "react";
import { CSVData, ColumnStats } from "@/lib/csv-utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, LineChart, Line, PieChart, Pie, Cell,
} from "recharts";

interface ChartsProps {
  data: CSVData;
  stats: ColumnStats[];
}

const COLORS = [
  "hsl(187, 85%, 53%)", "hsl(262, 80%, 65%)", "hsl(152, 69%, 50%)",
  "hsl(38, 92%, 60%)", "hsl(0, 84%, 60%)", "hsl(217, 91%, 60%)",
];

const Charts = ({ data, stats }: ChartsProps) => {
  const numericCols = stats.filter((s) => s.type === "numeric");
  const categoricalCols = stats.filter((s) => s.type === "categorical");

  const [selectedX, setSelectedX] = useState(numericCols[0]?.name || "");
  const [selectedY, setSelectedY] = useState(numericCols[1]?.name || numericCols[0]?.name || "");

  // Distribution chart for first numeric column
  const distributionData = numericCols[0]
    ? (() => {
        const vals = data.rows.map((r) => Number(r[numericCols[0].name])).filter((v) => !isNaN(v));
        const min = Math.min(...vals);
        const max = Math.max(...vals);
        const bins = 15;
        const binSize = (max - min) / bins || 1;
        const histogram = Array.from({ length: bins }, (_, i) => ({
          range: `${Math.round(min + i * binSize)}`,
          count: 0,
        }));
        vals.forEach((v) => {
          const idx = Math.min(Math.floor((v - min) / binSize), bins - 1);
          histogram[idx].count++;
        });
        return histogram;
      })()
    : [];

  // Pie chart for first categorical
  const pieData = categoricalCols[0]?.topValues?.map((v) => ({
    name: v.value,
    value: v.count,
  })) || [];

  // Scatter data
  const scatterData = selectedX && selectedY
    ? data.rows
        .map((r) => ({ x: Number(r[selectedX]), y: Number(r[selectedY]) }))
        .filter((d) => !isNaN(d.x) && !isNaN(d.y))
        .slice(0, 500)
    : [];

  // Line chart: first numeric column over index
  const lineData = numericCols[0]
    ? data.rows.slice(0, 200).map((r, i) => ({
        index: i,
        value: Number(r[numericCols[0].name]) || 0,
      }))
    : [];

  const selectClass = "bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary";

  if (numericCols.length === 0 && categoricalCols.length === 0) {
    return (
      <div className="glass rounded-xl p-8 text-center text-muted-foreground">
        Aucune colonne analysable pour générer des graphiques.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Distribution */}
      {distributionData.length > 0 && (
        <div className="glass rounded-xl p-5 animate-slide-up">
          <h3 className="text-sm font-semibold text-foreground mb-1">Distribution</h3>
          <p className="text-xs text-muted-foreground mb-4">{numericCols[0].name}</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={distributionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
              <XAxis dataKey="range" tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} />
              <Tooltip contentStyle={{ background: "hsl(222, 41%, 9%)", border: "1px solid hsl(222, 30%, 18%)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" fill="hsl(187, 85%, 53%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Pie */}
      {pieData.length > 0 && (
        <div className="glass rounded-xl p-5 animate-slide-up" style={{ animationDelay: "0.05s" }}>
          <h3 className="text-sm font-semibold text-foreground mb-1">Répartition</h3>
          <p className="text-xs text-muted-foreground mb-4">{categoricalCols[0].name}</p>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} strokeWidth={2} stroke="hsl(222, 41%, 9%)">
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(222, 41%, 9%)", border: "1px solid hsl(222, 30%, 18%)", borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {pieData.map((d, i) => (
              <span key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {d.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Scatter */}
      {numericCols.length >= 2 && (
        <div className="glass rounded-xl p-5 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Nuage de points</h3>
              <p className="text-xs text-muted-foreground">Corrélation entre variables</p>
            </div>
            <div className="flex gap-2">
              <select value={selectedX} onChange={(e) => setSelectedX(e.target.value)} className={selectClass}>
                {numericCols.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
              <select value={selectedY} onChange={(e) => setSelectedY(e.target.value)} className={selectClass}>
                {numericCols.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
              <XAxis dataKey="x" name={selectedX} tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} />
              <YAxis dataKey="y" name={selectedY} tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} />
              <Tooltip contentStyle={{ background: "hsl(222, 41%, 9%)", border: "1px solid hsl(222, 30%, 18%)", borderRadius: 8, fontSize: 12 }} />
              <Scatter data={scatterData} fill="hsl(262, 80%, 65%)" fillOpacity={0.6} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Line */}
      {lineData.length > 0 && (
        <div className="glass rounded-xl p-5 animate-slide-up" style={{ animationDelay: "0.15s" }}>
          <h3 className="text-sm font-semibold text-foreground mb-1">Tendance</h3>
          <p className="text-xs text-muted-foreground mb-4">{numericCols[0].name} (200 premières lignes)</p>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
              <XAxis dataKey="index" tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} />
              <Tooltip contentStyle={{ background: "hsl(222, 41%, 9%)", border: "1px solid hsl(222, 30%, 18%)", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="value" stroke="hsl(152, 69%, 50%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Charts;
