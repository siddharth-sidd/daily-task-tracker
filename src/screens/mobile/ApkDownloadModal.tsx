import React, { useState } from 'react';
import { useTasks } from '../../context/TaskContext.tsx';
import {
  X,
  Smartphone,
  CheckCircle,
  Copy,
  Sparkles,
  ArrowDownToLine,
  Share2,
  Info,
  ExternalLink,
} from 'lucide-react';

export const ApkDownloadModal: React.FC = () => {
  const { isApkModalOpen, setIsApkModalOpen } = useTasks();
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isApkModalOpen) return null;

  // The official public preview URL that works for anyone without 404/auth errors
  const publicShareUrl =
    'https://ais-pre-jlgimd45crsfw4zuouzm7r-428954089821.asia-southeast1.run.app';

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(publicShareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadApk = () => {
    window.location.href = '/daily-task-tracker.apk';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-teal-50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-teal-600 text-white shadow-sm">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Install App on Phone</h2>
              <p className="text-xs text-slate-500">Share with others & install on Android</p>
            </div>
          </div>
          <button
            onClick={() => setIsApkModalOpen(false)}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* Public Link Card (Fixes the 404 issue) */}
          <div className="p-4 rounded-3xl bg-teal-50/70 border border-teal-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-teal-700" />
                <h3 className="font-bold text-xs text-teal-950 uppercase tracking-wide">
                  Public Share Link (No 404 Error)
                </h3>
              </div>
              <span className="text-[10px] font-bold bg-teal-600 text-white px-2 py-0.5 rounded-full">
                Public URL
              </span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Share this exact public link with friends or team members. It is open to the public and works on any phone browser without requiring developer login:
            </p>

            <div className="flex items-center gap-2 p-2 rounded-2xl bg-white border border-teal-200">
              <input
                type="text"
                readOnly
                value={publicShareUrl}
                className="flex-1 text-[11px] font-mono text-slate-800 bg-transparent truncate outline-hidden pl-1"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-xl bg-teal-600 text-white font-bold text-[11px] hover:bg-teal-700 transition flex items-center gap-1 shrink-0 shadow-xs"
              >
                {copiedLink ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
            <p className="text-[10px] text-amber-700 font-medium flex items-center gap-1">
              <Info className="w-3 h-3 shrink-0" />
              <span>Note: Links containing <code className="bg-amber-100 px-1 rounded">ais-dev-...</code> are private developer sandboxes and will show 404 to other users. Always use the public link above!</span>
            </p>
          </div>

          {/* Method 1: Instant Native Phone Installation (Official Android WebAPK) */}
          <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                  Method 1: Instant Native Phone App (Recommended)
                </h3>
              </div>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                100% Reliable
              </span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Modern Android automatically compiles an official, signed WebAPK directly into your phone drawer without any installation errors:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-700 text-[11px] pl-1 font-medium">
              <li>Open the public link on your phone in <strong>Google Chrome</strong>.</li>
              <li>Tap the top-right menu icon (<strong>⋮</strong>).</li>
              <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
              <li>The Daily Task Tracker icon will appear on your home screen and app drawer, running as a standalone app without the browser URL bar!</li>
            </ol>
          </div>

          {/* Method 2: Standalone APK File */}
          <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowDownToLine className="w-4 h-4 text-slate-700" />
                <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                  Method 2: Direct APK Download
                </h3>
              </div>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Download the pre-packaged Android APK archive:
            </p>

            <button
              onClick={handleDownloadApk}
              className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs"
            >
              <ArrowDownToLine className="w-4 h-4 text-teal-400" />
              <span>Download daily-task-tracker.apk</span>
            </button>

            <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-[10px] leading-relaxed">
              <strong>Why some phones say "Problem parsing package":</strong> Android requires APKs to be cryptographically signed with a developer keystore and compiled using the Android SDK tools (<code className="bg-amber-100 px-1 rounded">apksigner</code> / <code className="bg-amber-100 px-1 rounded">d8</code>). For 100% compatibility, use <strong>Method 1 (Install via Chrome)</strong> or build with Capacitor / Android Studio as documented in <code className="bg-amber-100 px-1 rounded">DEVELOPER_GUIDE.md</code>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
