import { CsvUploadForm } from "@/components/upload/csv-upload-form";

export default function UploadPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Upload CSV</h1>
        <p className="text-muted-foreground">
          Upload zip_code, category, and state columns to start a search job
        </p>
      </div>
      <CsvUploadForm />
    </div>
  );
}
