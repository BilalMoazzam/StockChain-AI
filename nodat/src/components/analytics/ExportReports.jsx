// frontend/src/components/analytics/ExportReports.jsx

import React, { useState } from "react";

const REPORT_OPTIONS = [
  {
    label: "Inventory Report",
    endpoint: "/inventory",
    extractor: (resp) => resp.items || [],
  },
  {
    label: "AI Prediction Report",
    endpoint: "/predict-all",
    extractor: (resp) => resp || [],
  },
  {
    label: "Trending Report",
    endpoint: "/trending",
    extractor: (resp) => resp || [],
  },
];

const FORMAT_OPTIONS = ["CSV", "PDF"];

export default function ExportReports({ baseUrl = "http://localhost:5001" }) {
  const [reportType, setReportType] = useState(REPORT_OPTIONS[0].label);
  const [format, setFormat] = useState(FORMAT_OPTIONS[0]);

  const handleExport = async () => {
    const cfg = REPORT_OPTIONS.find((r) => r.label === reportType);
    try {
      const res = await fetch(baseUrl + cfg.endpoint);
      if (!res.ok) throw new Error(`Fetch failed ${res.status}`);
      const data = await res.json();
      const rows = cfg.extractor(data);
      if (!rows.length) {
        return alert("No data to export.");
      }

      if (format === "CSV") {
        const csv = toCSV(rows);
        download(csv, `${reportType}.csv, "text/csv"`);
      } else {
        // A very basic PDF shim
        const blob = new Blob([JSON.stringify(rows, null, 2)], {
          type: "application/pdf",
        });
        download(blob, `${reportType}.pdf`);
      }
    } catch (err) {
      console.error(err);
      alert("Error exporting report.");
    }
  };

  const toCSV = (arr) => {
    const headers = Object.keys(arr[0]);
    const lines = arr.map((o) =>
      headers.map((h) => JSON.stringify(o[h] ?? "")).join(",")
    );
    return [headers.join(","), ...lines].join("\r\n");
  };

  const download = (content, filename, mime) => {
    const blob =
      content instanceof Blob ? content : new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="section export-reports">
      <div className="section-header">
        <h3>Export Reports</h3>
      </div>
      <div className="form-row">
        <label>
          Report Type:
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            {REPORT_OPTIONS.map((o) => (
              <option key={o.label} value={o.label}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Format:
          <select value={format} onChange={(e) => setFormat(e.target.value)}>
            {FORMAT_OPTIONS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>
        <button onClick={handleExport}>Export Report</button>
      </div>
    </div>
  );
}