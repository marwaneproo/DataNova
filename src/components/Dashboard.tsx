import { useState, useMemo } from "react";
import { CSVData, analyzeColumn, generateInsights } from "@/lib/csv-utils";
import { BarChart3, Table, Brain, Lightbulb, ArrowLeft, Sparkles, Download } from "lucide-react";
import InsightsPanel from "./InsightsPanel";
import DataTable from "./DataTable";
import StatsCards from "./StatsCards";
import Charts from "./Charts";
import PredictionPanel from "./PredictionPanel";

interface DashboardProps {
  data: CSVData;
  onReset: () => void;
}

type Tab = "insights" | "data" | "charts" | "prediction";

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "insights", label: "Insights", icon: Lightbulb },
  { id: "data", label: "Données", icon: Table },
  { id: "charts", label: "Graphiques", icon: BarChart3 },
  { id: "prediction", label: "Prédiction", icon: Brain },
];

const Dashboard = ({ data, onReset }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState<Tab>("insights");

  const columnStats = useMemo(
    () => data.headers.map((h) => analyzeColumn(h, data.rows.map((r) => r[h]))),
    [data]
  );

  const insights = useMemo(() => generateInsights(data, columnStats), [data, columnStats]);

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify({ insights, stats: columnStats }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "datanova-report.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onReset} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-bold text-foreground">DataNova</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden md:block">
              {data.rows.length} lignes • {data.headers.length} colonnes
            </span>
            <button onClick={downloadJSON} className="flex items-center gap-1.5 text-xs bg-secondary hover:bg-secondary/80 px-3 py-1.5 rounded-lg transition-colors">
              <Download className="w-3.5 h-3.5" />
              Exporter
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-secondary/50 p-1 rounded-xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground glow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "insights" && (
          <div className="space-y-6">
            <InsightsPanel insights={insights} />
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Analyse par colonne</h3>
              <StatsCards stats={columnStats} />
            </div>
          </div>
        )}
        {activeTab === "data" && <DataTable data={data} />}
        {activeTab === "charts" && <Charts data={data} stats={columnStats} />}
        {activeTab === "prediction" && <PredictionPanel data={data} stats={columnStats} />}
      </div>
    </div>
  );
};

export default Dashboard;
