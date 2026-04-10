import { DataInsight } from "@/lib/csv-utils";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";

interface InsightsPanelProps {
  insights: DataInsight[];
}

const iconMap = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
};

const colorMap = {
  info: "text-info border-info/20 bg-info/5",
  warning: "text-warning border-warning/20 bg-warning/5",
  success: "text-success border-success/20 bg-success/5",
};

const InsightsPanel = ({ insights }: InsightsPanelProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {insights.map((insight, i) => {
        const Icon = iconMap[insight.type];
        return (
          <div
            key={i}
            className={`glass rounded-xl p-4 border animate-slide-up ${colorMap[insight.type]}`}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl">{insight.icon}</span>
              <div className="min-w-0">
                <h4 className="font-semibold text-foreground text-sm">{insight.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{insight.description}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default InsightsPanel;
