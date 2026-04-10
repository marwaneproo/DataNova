import { Upload, BarChart3, Brain, Sparkles } from "lucide-react";

interface HeroSectionProps {
  onGetStarted: () => void;
}

const HeroSection = ({ onGetStarted }: HeroSectionProps) => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: "var(--gradient-glow)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      {/* Logo */}
      <div className="animate-slide-up mb-8 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center glow">
          <Sparkles className="w-6 h-6 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          Data<span className="text-gradient">Nova</span>
        </h1>
      </div>

      {/* Tagline */}
      <p className="animate-slide-up text-center text-lg md:text-xl text-muted-foreground max-w-2xl mb-12" style={{ animationDelay: "0.1s" }}>
        Analysez, visualisez et prédisez à partir de vos données CSV en quelques secondes.
        <span className="text-gradient font-semibold"> Zéro code requis.</span>
      </p>

      {/* Feature cards */}
      <div className="animate-slide-up grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 max-w-3xl w-full" style={{ animationDelay: "0.2s" }}>
        {[
          { icon: Upload, title: "Upload CSV", desc: "Glissez-déposez votre fichier" },
          { icon: BarChart3, title: "Insights Auto", desc: "Stats & graphiques instantanés" },
          { icon: Brain, title: "Prédiction ML", desc: "Régression en un clic" },
        ].map((f, i) => (
          <div key={i} className="glass rounded-xl p-5 text-center hover:glow-sm transition-all duration-300 group cursor-default">
            <f.icon className="w-8 h-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={onGetStarted}
        className="animate-slide-up bg-gradient-primary text-primary-foreground font-semibold px-8 py-3.5 rounded-xl text-lg hover:opacity-90 transition-all glow hover:scale-105 active:scale-95"
        style={{ animationDelay: "0.3s" }}
      >
        Commencer l'analyse →
      </button>

      <p className="animate-fade-in text-xs text-muted-foreground mt-4" style={{ animationDelay: "0.5s" }}>
        Gratuit • Aucune inscription • 100% côté client
      </p>
    </div>
  );
};

export default HeroSection;
