"use client";

import { Download, FileText, Share2, ExternalLink, Image as ImageIcon } from "lucide-react";

type ReportRow = {
  id: string;
  network: string;
  platform: string;
  followersCount: number | null;
  postDate: string;
  postUrl: string;
  screenshotUrl: string | null;
  postDescription: string | null;
  storyTag: string | null;
  storyLink: string | null;
  impressions: number | null;
  likes: number | null;
};

type ReportData = {
  campaignId: string;
  campaignTitle: string;
  dateSubmitted: string;
  budgetEuros: number;
  postsCount: number;
  totalFollowers: number;
  totalImpressions: number;
  totalLikes: number;
  cpm: number | null;
  cpmResult: string;
  rows: ReportRow[];
};

function fmt(n: number | null): string {
  if (n === null) return "—";
  return n.toLocaleString("en-US");
}

function cpmColor(result: string): string {
  if (result === "Highly Above Average") return "text-green-600";
  if (result === "Above Average") return "text-green-500";
  if (result === "Average") return "text-amber-500";
  return "text-red-500";
}

export function ReportClient({ data }: { data: ReportData }) {
  function downloadCSV() {
    const headers = [
      "Network", "Platform", "Total Followers", "Date Post",
      "Post Description", "Story Tag", "Story Link",
      "Post Link", "Screenshot", "Impressions", "Likes",
    ];
    const csvRows = data.rows.map((r) => [
      r.network,
      r.platform,
      r.followersCount ?? "",
      r.postDate,
      r.postDescription ?? "",
      r.storyTag ?? "",
      r.storyLink ?? "",
      r.postUrl,
      r.screenshotUrl ?? "",
      r.impressions ?? "",
      r.likes ?? "",
    ]);
    const totals = [
      "TOTAL", "", fmt(data.totalFollowers), "",
      "", "", "", "", "",
      fmt(data.totalImpressions), fmt(data.totalLikes),
    ];

    const content = [headers, ...csvRows, totals]
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `report-${data.campaignTitle.toLowerCase().replace(/\s+/g, "-")}.csv`;
    link.click();
  }

  function printPDF() {
    window.print();
  }

  function copyShareLink() {
    navigator.clipboard.writeText(window.location.href);
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex-1 text-center">
          <h1 className="text-3xl font-black tracking-tight text-gray-900">
            CAMPAIGN <span className="text-[#3a51fb]">REPORT</span>
          </h1>
          <p className="text-lg font-bold text-gray-700 mt-1 uppercase tracking-wide">
            {data.campaignTitle}
          </p>
        </div>
        {/* Export buttons */}
        <div className="flex items-center gap-3 print:hidden">
          <button
            onClick={downloadCSV}
            className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors"
            title="Download CSV"
          >
            <Download className="h-5 w-5" />
            <span className="text-[10px] font-medium uppercase tracking-wide">CSV FILE</span>
          </button>
          <button
            onClick={printPDF}
            className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors"
            title="Save as PDF"
          >
            <FileText className="h-5 w-5" />
            <span className="text-[10px] font-medium uppercase tracking-wide">PDF FILE</span>
          </button>
          <button
            onClick={copyShareLink}
            className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors"
            title="Copy link"
          >
            <Share2 className="h-5 w-5" />
            <span className="text-[10px] font-medium uppercase tracking-wide">SHARE</span>
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-0 rounded-xl border border-gray-200 overflow-hidden mb-8">
        <div className="p-5 border-r border-gray-200">
          <div className="text-sm text-gray-500 space-y-1">
            <p>Date Submitted: <span className="font-bold text-gray-900">{data.dateSubmitted}</span></p>
            <p>Price: <span className="font-bold text-gray-900">{data.budgetEuros}€</span></p>
            <p>Posts &amp; Stories: <span className="font-bold text-gray-900">{data.postsCount}</span></p>
          </div>
        </div>
        <div className="p-5 border-r border-gray-200">
          <div className="text-sm text-gray-500 space-y-1">
            <p>Combined Followers: <span className="font-bold text-gray-900">{fmt(data.totalFollowers)}</span></p>
            <p>Impressions: <span className="font-bold text-gray-900">{fmt(data.totalImpressions)}</span></p>
            <p>Likes: <span className="font-bold text-gray-900">{fmt(data.totalLikes)}</span></p>
          </div>
        </div>
        <div className="p-5">
          <div className="text-sm text-gray-500 space-y-1">
            <p>CPM: <span className="font-bold text-gray-900">{data.cpm !== null ? `${data.cpm.toFixed(2)}€` : "—"}</span></p>
            <p>Average Instagram CPM: <span className="font-bold text-gray-900">5€ to 12€</span></p>
            <p>Result: <span className={`font-bold ${cpmColor(data.cpmResult)}`}>{data.cpmResult}</span></p>
          </div>
        </div>
      </div>

      {/* Table */}
      {data.rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 py-20 text-center text-gray-400">
          <p className="text-sm">No deliveries submitted yet.</p>
          <p className="text-xs mt-1">Creators must submit their posts from the applications page.</p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#3a51fb] text-white text-xs font-semibold uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Networks</th>
                  <th className="px-4 py-3 text-right">Total Followers</th>
                  <th className="px-4 py-3 text-left">Date Post</th>
                  <th className="px-4 py-3 text-left">Post Description</th>
                  <th className="px-4 py-3 text-left">Story Tag</th>
                  <th className="px-4 py-3 text-left">Story Link</th>
                  <th className="px-4 py-3 text-center">Post Link</th>
                  <th className="px-4 py-3 text-center">Screenshot</th>
                  <th className="px-4 py-3 text-right">Impressions</th>
                  <th className="px-4 py-3 text-right">Likes</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row, i) => (
                  <tr
                    key={row.id}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{row.platform}</span>
                        {row.network}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">{fmt(row.followersCount)}</td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{row.postDate}</td>
                    <td className="px-4 py-3 text-gray-700 max-w-[180px] truncate" title={row.postDescription ?? ""}>
                      {row.postDescription ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{row.storyTag ?? "—"}</td>
                    <td className="px-4 py-3">
                      {row.storyLink ? (
                        <a href={row.storyLink} target="_blank" rel="noopener noreferrer" className="text-[#3a51fb] hover:underline text-xs truncate block max-w-[120px]">
                          {row.storyLink.replace("https://", "")}
                        </a>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <a href={row.postUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#3a51fb] hover:text-[#3a51fb]/80">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.screenshotUrl ? (
                        <a href={row.screenshotUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#3a51fb] hover:text-[#3a51fb]/80">
                          <ImageIcon className="h-3.5 w-3.5" />
                        </a>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">{fmt(row.impressions)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{fmt(row.likes)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-[#dc3d35] text-white font-bold text-sm">
                  <td className="px-4 py-3">PRICE: {data.budgetEuros}€</td>
                  <td className="px-4 py-3 text-right">{fmt(data.totalFollowers)}</td>
                  <td colSpan={6} />
                  <td className="px-4 py-3 text-right">{fmt(data.totalImpressions)}</td>
                  <td className="px-4 py-3 text-right">{fmt(data.totalLikes)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="text-center text-xs text-gray-400 py-2 border-t border-gray-100">
            *You can change the width of the columns. Just drag the header.
          </p>
        </div>
      )}
    </div>
  );
}
