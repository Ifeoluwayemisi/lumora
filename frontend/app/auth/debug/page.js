"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DebugPage() {
  const [store, setStore] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Collect all storage data
    const combined = {
      localStorage: {},
      sessionStorage: {},
      cookies: {},
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };

    // Get localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      try {
        const val = localStorage.getItem(key);
        combined.localStorage[key] = val?.length > 200 ? val.substring(0, 200) + "..." : val;
      } catch (e) {
        combined.localStorage[key] = "[ERROR]";
      }
    }

    // Get sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      try {
        const val = sessionStorage.getItem(key);
        combined.sessionStorage[key] = val?.length > 200 ? val.substring(0, 200) + "..." : val;
      } catch (e) {
        combined.sessionStorage[key] = "[ERROR]";
      }
    }

    // Get cookies
    const cookies = document.cookie.split(";").map((c) => c.trim());
    combined.cookies = cookies;

    setStore(combined);
    setLoading(false);
  }, []);

  const clearAll = () => {
    localStorage.clear();
    sessionStorage.clear();
    setStore({});
    alert("Storage cleared!");
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          OAuth Debug Dashboard
        </h1>

        {/* Quick Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Current State
          </h2>
          <div className="space-y-2 text-sm font-mono">
            <p>
              <strong>Timestamp:</strong> {store.timestamp}
            </p>
            <p>
              <strong>URL:</strong> <code className="bg-gray-100 dark:bg-gray-700 p-1 rounded">{store.url}</code>
            </p>
            <p>
              <strong>Local Storage Items:</strong> {Object.keys(store.localStorage || {}).length}
            </p>
            <p>
              <strong>Session Storage Items:</strong> {Object.keys(store.sessionStorage || {}).length}
            </p>
            <p>
              <strong>Cookies:</strong> {(store.cookies || []).length}
            </p>
          </div>
        </div>

        {/* OAuth Callback Debug Info */}
        {store.localStorage?.oauth_callback_debug && (
          <div className="bg-blue-50 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-3 text-blue-900 dark:text-blue-100">
              ✓ OAuth Callback Debug Info
            </h3>
            <div className="text-sm font-mono space-y-1">
              {(() => {
                try {
                  const info = JSON.parse(store.localStorage.oauth_callback_debug);
                  return (
                    <>
                      <p><strong>Timestamp:</strong> {info.timestamp}</p>
                      <p><strong>Has Token:</strong> <span className={info.hasToken ? "text-green-600" : "text-red-600"}>{info.hasToken ? "✓ YES" : "✗ NO"}</span></p>
                      <p><strong>Has User:</strong> <span className={info.hasUser ? "text-green-600" : "text-red-600"}>{info.hasUser ? "✓ YES" : "✗ NO"}</span></p>
                      <p><strong>Token Length:</strong> {info.tokenLength} chars</p>
                      <p><strong>User Data Length:</strong> {info.userLength} chars</p>
                      {info.error && <p className="text-red-600"><strong>Error:</strong> {info.error}</p>}
                      {info.message && <p className="text-red-600"><strong>Message:</strong> {info.message}</p>}
                    </>
                  );
                } catch (e) {
                  return <p className="text-red-600">Invalid JSON: {e.message}</p>;
                }
              })()}
            </div>
          </div>
        )}

        {/* OAuth Error */}
        {store.localStorage?.oauth_error && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-3 text-red-900 dark:text-red-100">
              ✗ OAuth Error Detected
            </h3>
            <p className="text-sm font-mono text-red-800 dark:text-red-200">
              {store.localStorage.oauth_error}
            </p>
          </div>
        )}

        {/* OAuth Success */}
        {store.localStorage?.oauth_success && (
          <div className="bg-green-50 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-3 text-green-900 dark:text-green-100">
              ✓ OAuth Success
            </h3>
            <p className="text-sm font-mono text-green-800 dark:text-green-200">
              Redirected to: <strong>{store.localStorage.oauth_success}</strong>
            </p>
          </div>
        )}

        {/* LocalStorage */}
        {Object.keys(store.localStorage || {}).length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Local Storage
            </h2>
            <div className="space-y-2 text-sm font-mono">
              {Object.entries(store.localStorage).map(([key, value]) => (
                <div key={key} className="border-b border-gray-200 dark:border-gray-700 pb-2">
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong className="text-blue-600 dark:text-blue-400">{key}:</strong>
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 break-words ml-4">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SessionStorage */}
        {Object.keys(store.sessionStorage || {}).length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Session Storage
            </h2>
            <div className="space-y-2 text-sm font-mono">
              {Object.entries(store.sessionStorage).map(([key, value]) => (
                <div key={key} className="border-b border-gray-200 dark:border-gray-700 pb-2">
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong className="text-purple-600 dark:text-purple-400">{key}:</strong>
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 break-words ml-4">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cookies */}
        {(store.cookies || []).filter(c => c).length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Cookies
            </h2>
            <div className="space-y-2 text-sm font-mono">
              {store.cookies.filter(c => c).map((cookie, i) => (
                <p key={i} className="text-gray-600 dark:text-gray-400">
                  {cookie}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh
          </button>
          <button
            onClick={clearAll}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Clear All Storage
          </button>
          <Link
            href="/auth/login"
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
