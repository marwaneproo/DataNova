import { useState, useRef } from "react";
import { CSVData } from "@/lib/csv-utils";
import HeroSection from "@/components/HeroSection";
import FileUpload from "@/components/FileUpload";
import Dashboard from "@/components/Dashboard";

const Index = () => {
  const [data, setData] = useState<CSVData | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const uploadRef = useRef<HTMLDivElement>(null);

  const handleGetStarted = () => {
    setShowUpload(true);
    setTimeout(() => uploadRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  if (data) {
    return <Dashboard data={data} onReset={() => { setData(null); setShowUpload(false); }} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <HeroSection onGetStarted={handleGetStarted} />
      {showUpload && (
        <div ref={uploadRef} className="pb-24 px-4">
          <FileUpload onDataLoaded={setData} />
        </div>
      )}
    </div>
  );
};

export default Index;
