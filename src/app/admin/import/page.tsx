"use client";
import { useState, useRef } from "react";
import { MOCK_CUSTOMERS } from "@/data/mock/customers";
import Toast from "@/components/Toast";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";

type ImportStatus = "idle" | "parsing" | "preview" | "success" | "error";

type PreviewRow = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  valid: boolean;
  error?: string;
  duplicate?: boolean;
};

const SAMPLE_CSV = `firstName,lastName,email,phone
Tyler,Morrison,tyler.morrison@email.com,443-555-1001
Jordan,Rivera,jordan.rivera@email.com,443-555-2002
Sam,Kowalski,sam.kowalski@email.com,443-555-3003`;

const REQUIRED_HEADERS = ["firstName", "lastName", "email"];

function parseCSV(text: string, existingEmails: Set<string>): PreviewRow[] {
  const lines = text.trim().split("\n").map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim());
  return lines.slice(1).map(line => {
    const vals = line.split(",").map(v => v.trim());
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = vals[i] ?? ""; });

    const missing = REQUIRED_HEADERS.filter(h => !obj[h]);
    const valid = missing.length === 0;
    const duplicate = valid && existingEmails.has((obj.email ?? "").toLowerCase());
    return {
      firstName: obj.firstName ?? "",
      lastName: obj.lastName ?? "",
      email: obj.email ?? "",
      phone: obj.phone ?? "",
      valid: valid && !duplicate,
      duplicate,
      error: missing.length > 0 ? `Missing: ${missing.join(", ")}` : undefined,
    };
  });
}

export default function ImportPage() {
  const [status, setStatus] = useState<ImportStatus>("idle");
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const existingEmails = new Set(MOCK_CUSTOMERS.map(c => c.email.toLowerCase()));

  function handleFile(file: File) {
    setFileName(file.name);
    setStatus("parsing");
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text, existingEmails);
      if (parsed.length === 0) {
        setStatus("error");
        setToast({ message: "Could not parse CSV. Check that headers match the required format.", type: "error" });
        return;
      }
      setRows(parsed);
      setStatus("preview");
    };
    reader.readAsText(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".csv")) handleFile(file);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function confirmImport() {
    const valid = rows.filter(r => r.valid);
    const dupes = rows.filter(r => r.duplicate).length;
    setStatus("success");
    setToast({
      message: `${valid.length} customer(s) imported.${dupes > 0 ? ` ${dupes} duplicate(s) skipped.` : ""}`,
      type: "success",
    });
  }

  function reset() {
    setStatus("idle");
    setRows([]);
    setFileName("");
    if (fileRef.current) fileRef.current.value = "";
  }

  function downloadSample() {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dsa_customers_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const validCount = rows.filter(r => r.valid).length;
  const invalidCount = rows.filter(r => !r.valid && !r.duplicate).length;
  const dupeCount = rows.filter(r => r.duplicate).length;

  return (
    <div className="p-6 lg:p-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#212529]">Import Customers</h1>
          <p className="text-sm text-[#6c757d] mt-0.5">Import customer contact data from Yahoo or Google export (CSV format)</p>
        </div>
        <button onClick={downloadSample} className="btn-secondary text-sm flex items-center gap-1.5">
          <FileText className="w-4 h-4" />Download Template
        </button>
      </div>

      {/* Required columns info */}
      <div className="card p-4 mb-6 bg-blue-50 border-blue-200">
        <p className="text-sm font-medium text-blue-800 mb-1">Required CSV columns</p>
        <p className="text-xs text-blue-700 font-mono">{REQUIRED_HEADERS.join(", ")}</p>
        <p className="text-xs text-blue-600 mt-1">Optional: <span className="font-mono">phone</span></p>
        <p className="text-xs text-blue-500 mt-1">Duplicate emails (already in system) are automatically skipped.</p>
      </div>

      {status === "idle" || status === "parsing" ? (
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          className="card border-2 border-dashed border-gray-300 hover:border-[#337C99] transition-colors rounded-xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer"
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="w-10 h-10 text-[#6c757d]" />
          <div className="text-center">
            <p className="font-medium text-[#212529]">Drop a CSV file here, or click to browse</p>
            <p className="text-sm text-[#6c757d] mt-1">Accepts .csv files only</p>
          </div>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileInput} />
          {status === "parsing" && <p className="text-sm text-[#337C99]">Parsing…</p>}
        </div>
      ) : status === "success" ? (
        <div className="card p-12 flex flex-col items-center gap-4 text-center">
          <CheckCircle className="w-12 h-12 text-green-500" />
          <div>
            <p className="text-lg font-bold text-[#212529]">Import Complete</p>
            <p className="text-sm text-[#6c757d] mt-1">{validCount} customer record(s) imported successfully.</p>
            {dupeCount > 0 && <p className="text-sm text-[#6c757d]">{dupeCount} duplicate(s) were skipped.</p>}
          </div>
          <button onClick={reset} className="btn-secondary text-sm">Import Another File</button>
        </div>
      ) : status === "error" ? (
        <div className="card p-12 flex flex-col items-center gap-4 text-center">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <div>
            <p className="text-lg font-bold text-[#212529]">Parse Error</p>
            <p className="text-sm text-[#6c757d] mt-1">Could not read the CSV file. Please check the format and try again.</p>
          </div>
          <button onClick={reset} className="btn-secondary text-sm">Try Again</button>
        </div>
      ) : (
        /* Preview */
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium text-[#212529]">{fileName}</p>
              <p className="text-sm text-[#6c757d]">
                {rows.length} row(s) —{" "}
                <span className="text-green-600">{validCount} to import</span>
                {dupeCount > 0 && <>, <span className="text-amber-600">{dupeCount} duplicate{dupeCount !== 1 ? "s" : ""}</span></>}
                {invalidCount > 0 && <>, <span className="text-red-600">{invalidCount} invalid</span></>}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={reset} className="btn-secondary text-sm">Cancel</button>
              <button
                onClick={confirmImport}
                disabled={validCount === 0}
                className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Import {validCount} Record{validCount !== 1 ? "s" : ""}
              </button>
            </div>
          </div>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200">
                <tr>
                  {["", "First Name", "Last Name", "Email", "Phone", "Note"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-[#6c757d] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row, i) => (
                  <tr key={i} className={row.valid ? "hover:bg-gray-50" : row.duplicate ? "bg-amber-50" : "bg-red-50"}>
                    <td className="px-4 py-2.5">
                      {row.valid
                        ? <CheckCircle className="w-4 h-4 text-green-500" />
                        : row.duplicate
                          ? <AlertCircle className="w-4 h-4 text-amber-500" />
                          : <AlertCircle className="w-4 h-4 text-red-500" />}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-[#212529]">{row.firstName || <span className="text-red-500">—</span>}</td>
                    <td className="px-4 py-2.5 text-[#212529]">{row.lastName || <span className="text-red-500">—</span>}</td>
                    <td className="px-4 py-2.5 text-[#6c757d]">{row.email || <span className="text-red-500">—</span>}</td>
                    <td className="px-4 py-2.5 text-[#6c757d]">{row.phone || "—"}</td>
                    <td className="px-4 py-2.5 text-xs">
                      {row.duplicate
                        ? <span className="text-amber-700">Already in system</span>
                        : row.error
                          ? <span className="text-red-600">{row.error}</span>
                          : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(invalidCount > 0 || dupeCount > 0) && (
            <p className="text-xs text-[#6c757d] mt-3">Invalid and duplicate rows are skipped during import.</p>
          )}
        </div>
      )}
    </div>
  );
}
