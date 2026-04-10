import { useState } from "react";
import { CSVData, ColumnStats, linearRegression } from "@/lib/csv-utils";
import { Brain, TrendingUp, Target, Zap } from "lucide-react";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Line, ComposedChart,
} from "recharts";

interface PredictionPanelProps {
  data: CSVData;
  stats: ColumnStats[];
}

const PredictionPanel = ({ data, stats }: PredictionPanelProps) => {
  const numericCols = stats.filter((s) => s.type === "numeric");
  const [target, setTarget] = useState(numericCols[numericCols.length - 1]?.name || "");
  const [feature, setFeature] = useState(numericCols[0]?.name || "");
  const [result, setResult] = useState<ReturnType<typeof linearRegression> | null>(null);
  const [chartData, setChartData] = useState<{ x: number; y: number; predicted: number }[]>([]);

  if (numericCols.length < 2) {
    return (
      <div className="glass rounded-xl p-8 text-center">
        <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">Il faut au moins 2 colonnes numériques pour la prédiction.</p>
      </div>
    );
  }

  const runPrediction = () => {
    const xVals: number[] = [];
    const yVals: number[] = [];
    data.rows.forEach((row) => {
      const x = Number(row[feature]);
      const y = Number(row[target]);
      if (!isNaN(x) && !isNaN(y)) {
        xVals.push(x);
        yVals.push(y);
      }
    });

    if (xVals.length < 3) return;

    const res = linearRegression(xVals, yVals);
    setResult(res);

    const sampled = xVals.map((x, i) => ({
      x,
      y: yVals[i],
      predicted: res.predictions[i],
    }));
    // sort by x for line
    sampled.sort((a, b) => a.x - b.x);
    setChartData(sampled.slice(0, 300));
  };

  const selectClass = "bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full";

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Régression Linéaire</h3>
            <p className="text-xs text-muted-foreground">Prédisez une variable à partir d'une autre</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Variable explicative (X)</label>
            <select value={feature} onChange={(e) => setFeature(e.target.value)} className={selectClass}>
              {numericCols.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Variable cible (Y)</label>
            <select value={target} onChange={(e) => setTarget(e.target.value)} className={selectClass}>
              {numericCols.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={runPrediction}
          className="w-full bg-gradient-primary text-primary-foreground font-semibold py-3 rounded-xl hover:opacity-90 transition-all glow hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4" />
          Lancer la prédiction
        </button>
      </div>

      {result && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="glass rounded-xl p-4 text-center">
              <Target className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">R² Score</p>
              <p className={`text-2xl font-bold ${result.r2 > 0.7 ? "text-success" : result.r2 > 0.4 ? "text-warning" : "text-destructive"}`}>
                {result.r2}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {result.r2 > 0.7 ? "Excellent fit" : result.r2 > 0.4 ? "Fit modéré" : "Fit faible"}
              </p>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <TrendingUp className="w-5 h-5 text-accent mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Pente</p>
              <p className="text-2xl font-bold text-foreground">{result.slope}</p>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <span className="text-xl block mb-1">📐</span>
              <p className="text-xs text-muted-foreground">Ordonnée</p>
              <p className="text-2xl font-bold text-foreground">{result.intercept}</p>
            </div>
          </div>

          <div className="glass rounded-xl p-5">
            <h4 className="text-sm font-semibold text-foreground mb-1">Données vs Prédiction</h4>
            <p className="text-xs text-muted-foreground mb-4">
              <span className="text-primary">●</span> Données réelles &nbsp;
              <span className="text-destructive">—</span> Ligne de régression
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
                <XAxis dataKey="x" name={feature} tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} />
                <Tooltip contentStyle={{ background: "hsl(222, 41%, 9%)", border: "1px solid hsl(222, 30%, 18%)", borderRadius: 8, fontSize: 12 }} />
                <Scatter dataKey="y" fill="hsl(187, 85%, 53%)" fillOpacity={0.5} name="Réel" />
                <Line type="monotone" dataKey="predicted" stroke="hsl(0, 84%, 60%)" strokeWidth={2} dot={false} name="Prédiction" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="glass rounded-xl p-5">
            <h4 className="text-sm font-semibold text-foreground mb-2">📝 Équation du modèle</h4>
            <p className="font-mono text-primary text-sm bg-secondary/50 p-3 rounded-lg">
              {target} = {result.slope} × {feature} + {result.intercept}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default PredictionPanel;
