import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../services/api';
import { QrCode, Box, Search, Wrench, ShieldCheck, RefreshCw, X, AlertTriangle } from 'lucide-react';

const QRScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [assetDetails, setAssetDetails] = useState(null);
  const [manualTag, setManualTag] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef(null);

  // Success handler for camera scan
  const onScanSuccess = async (decodedText) => {
    if (decodedText.startsWith('AST-')) {
      setScanResult(decodedText);
      // Stop scanner upon successful detection to prevent duplicate API hits
      if (scannerRef.current) {
        try {
          await scannerRef.current.clear();
        } catch (e) {
          console.warn('Failed to clear scanner:', e);
        }
      }
      handleLookup(decodedText);
    } else {
      setError('Invalid QR code format. Must start with "AST-".');
    }
  };

  const onScanFailure = (error) => {
    // Quietly log scanner failures as they trigger constantly when searching frames
  };

  useEffect(() => {
    // Instantiate camera scanner
    const scanner = new Html5QrcodeScanner(
      'reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      /* verbose= */ false
    );

    scanner.render(onScanSuccess, onScanFailure);
    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((err) => {
          console.warn('Scanner cleanup error:', err);
        });
      }
    };
  }, []);

  const handleLookup = async (tag) => {
    setError('');
    setLoading(true);
    setAssetDetails(null);
    try {
      const response = await api.get(`/assets/tag/${tag}`);
      setAssetDetails(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || `Asset with tag ${tag} not found.`);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (!manualTag) return;
    const uppercaseTag = manualTag.trim().toUpperCase();
    handleLookup(uppercaseTag);
  };

  const handleQuickReturn = async () => {
    if (!assetDetails || !assetDetails.allocations?.[0]) return;
    try {
      setLoading(true);
      await api.post(`/allocations/${assetDetails.allocations[0].id}/return`);
      alert('Asset return processed successfully!');
      // Reload asset
      handleLookup(assetDetails.assetTag);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process return');
      setLoading(false);
    }
  };

  const handleResetScanner = () => {
    setScanResult(null);
    setAssetDetails(null);
    setError('');
    // Re-mount scanner
    if (scannerRef.current) {
      try {
        scannerRef.current.render(onScanSuccess, onScanFailure);
      } catch (err) {
        console.warn('Failed to restart scanner:', err);
      }
    }
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Asset QR Code Scanner
        </h1>
        <p className="text-sm text-gray-500">
          Scan an asset's QR tag with your webcam or type the ID manually for instant audit, allocations, or ticket actions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left Card: Camera reader / manual entry */}
        <div className="rounded-3xl border border-gray-150 bg-white p-6 dark:border-gray-800 dark:bg-gray-950 shadow-sm space-y-6">
          <h3 className="font-display text-lg font-bold flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary-500" />
            <span>Webcam Scanner</span>
          </h3>

          {/* Scanner UI */}
          <div className="relative overflow-hidden rounded-2xl border border-gray-150 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 min-h-[300px] flex items-center justify-center">
            {scanResult ? (
              <div className="text-center p-6 space-y-3">
                <ShieldCheck className="h-12 w-12 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-gray-900 dark:text-white">Scan Captured!</h4>
                <p className="text-xs font-mono bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full dark:bg-emerald-950/40 dark:text-emerald-400">
                  {scanResult}
                </p>
                <button
                  onClick={handleResetScanner}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Scan Next Item</span>
                </button>
              </div>
            ) : (
              <div className="w-full">
                <div id="reader" className="w-full"></div>
                <div className="absolute inset-x-0 top-0 h-1 bg-red-500/80 animate-scan"></div>
              </div>
            )}
          </div>

          {/* Manual Entry Fallback */}
          <div className="border-t border-gray-100 pt-6 dark:border-gray-850">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Or manually type asset tag
            </p>
            <form onSubmit={handleManualSearch} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. AST-1001"
                value={manualTag}
                onChange={(e) => setManualTag(e.target.value)}
                className="flex-1 rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:bg-white dark:border-gray-800 dark:bg-gray-900"
              />
              <button
                type="submit"
                className="rounded-xl bg-gray-900 px-4 text-white hover:bg-gray-850 dark:bg-gray-800 dark:hover:bg-gray-700 cursor-pointer"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {/* Right Card: Asset Details & Actions */}
        <div className="space-y-6">
          {loading && (
            <div className="rounded-3xl border border-gray-150 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-950 shadow-sm flex flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary-500 border-t-transparent"></div>
              <p className="text-sm text-gray-500">Searching inventory database...</p>
            </div>
          )}

          {error && (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 dark:border-red-950/20 dark:bg-red-950/10 text-center shadow-sm space-y-3">
              <AlertTriangle className="h-10 w-10 text-red-500 mx-auto" />
              <h4 className="font-bold text-red-800 dark:text-red-400">Lookup Error</h4>
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {!loading && !error && !assetDetails && (
            <div className="rounded-3xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-800 shadow-sm text-gray-400 space-y-2">
              <Box className="h-12 w-12 mx-auto text-gray-300" />
              <h4 className="font-bold text-sm">No Asset Selected</h4>
              <p className="text-xs">Scan a QR code or submit a manual search to retrieve audit commands.</p>
            </div>
          )}

          {!loading && assetDetails && (
            <div className="rounded-3xl border border-gray-150 bg-white p-6 dark:border-gray-800 dark:bg-gray-950 shadow-sm space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono font-bold text-xs bg-primary-100 text-primary-700 px-3 py-1 rounded-full dark:bg-primary-950/40 dark:text-primary-400">
                    {assetDetails.assetTag}
                  </span>
                  <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white mt-2">
                    {assetDetails.name}
                  </h3>
                  <p className="text-xs text-gray-400">S/N: {assetDetails.serialNumber}</p>
                </div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  assetDetails.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' :
                  assetDetails.status === 'ALLOCATED' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400' :
                  'bg-amber-100 text-amber-800 dark:bg-amber-950/40'
                }`}>
                  {assetDetails.status.replace('_', ' ')}
                </span>
              </div>

              {/* Specifications List */}
              <div className="grid grid-cols-2 gap-4 text-sm border-t border-b border-gray-100 py-4 dark:border-gray-850">
                <div>
                  <span className="text-xs text-gray-400 font-semibold block">Category</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{assetDetails.category.name}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-semibold block">Location</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{assetDetails.location}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-semibold block">Condition</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{assetDetails.condition}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-semibold block">Ownership</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {assetDetails.isShared ? 'Shared Resource' : 'Individual Asset'}
                  </span>
                </div>
              </div>

              {/* Assignment details */}
              {assetDetails.status === 'ALLOCATED' && assetDetails.allocations?.[0] && (
                <div className="p-4 rounded-2xl bg-indigo-50/20 border border-indigo-100 dark:border-indigo-950/20 text-sm">
                  <p className="font-semibold text-indigo-900 dark:text-indigo-400">Current Allocation</p>
                  <p className="mt-1 text-gray-800 dark:text-gray-200">
                    Assigned to: <span className="font-bold">{assetDetails.allocations[0].employee?.name}</span>
                  </p>
                  <p className="text-xs text-gray-500">{assetDetails.allocations[0].employee?.email}</p>
                </div>
              )}

              {/* Quick Actions Panel */}
              <div className="space-y-3">
                <h4 className="font-semibold text-xs text-gray-400 uppercase tracking-wider">Quick Actions</h4>

                {assetDetails.status === 'ALLOCATED' && assetDetails.allocations?.[0] && (
                  <button
                    onClick={handleQuickReturn}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 py-3 text-sm font-semibold text-white hover:bg-amber-500 cursor-pointer shadow-md shadow-amber-500/10"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Process Return Audit</span>
                  </button>
                )}

                <button
                  onClick={() => alert(`Redirecting to raise ticket for asset ${assetDetails.assetTag}`)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900 cursor-pointer"
                >
                  <Wrench className="h-4 w-4" />
                  <span>Request Maintenance Ticket</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
