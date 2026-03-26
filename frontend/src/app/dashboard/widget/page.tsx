"use client";

import { useEffect, useState } from "react";
import { businessApi } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";
import { Copy, Check, Code2, Link2, Monitor } from "lucide-react";

export default function WidgetPage() {
  const [slug, setSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"iframe" | "link">("iframe");
  const [width, setWidth] = useState("100%");
  const [height, setHeight] = useState("700");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    businessApi.getMyBusiness()
      .then((b) => setSlug(b.slug))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const bookingUrl = slug ? baseUrl + "/book/" + slug : "";
  const iframeCode = '<iframe src="' + bookingUrl + '" width="' + width + '" height="' + height + '" frameborder="0" style="border-radius: 16px; border: 1px solid #e5e7eb;"></iframe>';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;

  if (!slug) return (
    <div className="bg-white rounded-2xl p-16 shadow-sm border border-gray-200 text-center">
      <Code2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Configurez d&apos;abord votre page</h3>
      <p className="text-gray-500 text-sm">Définissez un slug dans Configuration pour activer le widget.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Monitor className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900">Aperçu</h2>
        </div>
        <div className="bg-gray-100 rounded-xl p-4 flex justify-center">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden" style={{ height: "400px" }}>
            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg mb-3">
                {slug[0]?.toUpperCase()}
              </div>
              <p className="font-semibold text-gray-900 mb-1">Votre page de réservation</p>
              <p className="text-xs text-gray-500 mb-4">{bookingUrl}</p>
              <div className="w-full space-y-2">
                <div className="h-8 bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-8 bg-gray-100 rounded-lg animate-pulse w-3/4" />
                <div className="h-8 bg-gray-100 rounded-lg animate-pulse w-1/2" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Code d&apos;intégration</h2>
        <div className="flex gap-2 mb-4">
          <button onClick={() => setTab("iframe")}
            className={"px-4 py-2 rounded-xl text-sm font-medium transition-all " + (tab === "iframe" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
            <Code2 className="h-4 w-4 inline mr-1.5" />iframe
          </button>
          <button onClick={() => setTab("link")}
            className={"px-4 py-2 rounded-xl text-sm font-medium transition-all " + (tab === "link" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
            <Link2 className="h-4 w-4 inline mr-1.5" />Lien direct
          </button>
        </div>

        {tab === "iframe" ? (
          <div>
            <div className="flex gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Largeur</label>
                <input type="text" value={width} onChange={(e) => setWidth(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm w-24 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Hauteur (px)</label>
                <input type="text" value={height} onChange={(e) => setHeight(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm w-24 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
              </div>
            </div>
            <div className="relative">
              <pre className="bg-slate-900 text-green-400 rounded-xl p-4 text-sm font-mono overflow-x-auto whitespace-pre-wrap break-all">{iframeCode}</pre>
              <button onClick={() => copyToClipboard(iframeCode)}
                className="absolute top-3 right-3 p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors">
                {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
        ) : (
          <div className="relative">
            <pre className="bg-slate-900 text-blue-400 rounded-xl p-4 text-sm font-mono overflow-x-auto">{bookingUrl}</pre>
            <button onClick={() => copyToClipboard(bookingUrl)}
              className="absolute top-3 right-3 p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors">
              {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        )}

        {copied && <p className="text-xs text-green-600 mt-2">Copié dans le presse-papiers !</p>}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Comment intégrer</h2>
        <ol className="space-y-3 text-sm text-gray-600">
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">1</span>
            <span>Copiez le code iframe ci-dessus</span>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">2</span>
            <span>Collez-le dans le HTML de votre site web, à l&apos;endroit souhaité</span>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">3</span>
            <span>Vos clients pourront réserver directement depuis votre site</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
