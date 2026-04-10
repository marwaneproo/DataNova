import { useState, useCallback, useRef } from "react";
import { Upload, FileSpreadsheet, X, Loader2 } from "lucide-react";
import { parseCSV, CSVData } from "@/lib/csv-utils";

interface FileUploadProps {
  onDataLoaded: (data: CSVData) => void;
}

const FileUpload = ({ onDataLoaded }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith(".csv")) {
      setError("Veuillez uploader un fichier CSV");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError("Fichier trop volumineux (max 50 MB)");
      return;
    }
    setError(null);
    setIsLoading(true);
    setFileName(file.name);
    try {
      const data = await parseCSV(file);
      if (data.rows.length === 0) {
        setError("Le fichier est vide");
        setIsLoading(false);
        return;
      }
      onDataLoaded(data);
    } catch {
      setError("Erreur lors du parsing du fichier");
    }
    setIsLoading(false);
  }, [onDataLoaded]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div className="w-full max-w-xl mx-auto animate-slide-up">
      <div
        className={`relative glass rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
          isDragging ? "border-primary glow scale-[1.02]" : "hover:border-primary/50 hover:glow-sm"
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-muted-foreground">Analyse de <span className="text-foreground font-medium">{fileName}</span>...</p>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              {fileName ? (
                <FileSpreadsheet className="w-8 h-8 text-primary" />
              ) : (
                <Upload className="w-8 h-8 text-primary" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {fileName || "Glissez votre CSV ici"}
            </h3>
            <p className="text-sm text-muted-foreground">
              ou cliquez pour parcourir • Max 50 MB
            </p>
          </>
        )}

        {error && (
          <div className="mt-4 flex items-center justify-center gap-2 text-destructive text-sm">
            <X className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
