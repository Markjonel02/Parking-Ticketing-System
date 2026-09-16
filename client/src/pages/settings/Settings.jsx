// client/src/pages/settings/Settings.jsx
import React, { useState, useEffect } from "react";
import { Button } from "../../components/common/Button.jsx";
import {
  Settings as SettingsIcon,
  Shield,
  Server,
  RotateCw,
  Database,
  CheckCircle2,
} from "lucide-react";
import { useAppContext } from "../../context/AppContext.jsx";
import axiosInstance from "../../services/api/axiosInstance.js";

export function Settings() {
  const { showToast, triggerRefresh } = useAppContext();
  const [health, setHealth] = useState(null);
  const [dbStatus, setDbStatus] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);
  const [isSyncingDb, setIsSyncingDb] = useState(false);

  async function checkHealth() {
    setIsLoadingHealth(true);
    try {
      const res = await axiosInstance.get("/health");
      setHealth(res);
      if (res?.database) {
        setDbStatus(res.database);
      }
    } catch (e) {
      setHealth({ status: "offline", message: e.message });
    } finally {
      setIsLoadingHealth(false);
    }
  }

  async function syncDatabase() {
    setIsSyncingDb(true);
    try {
      const res = await axiosInstance.post("/database/sync");
      if (res.success) {
        setDbStatus(res.data);
        showToast("MongoDB database synchronization successful", "success");
      }
    } catch (e) {
      showToast("Database synchronization note: " + e.message, "info");
    } finally {
      setIsSyncingDb(false);
    }
  }

  async function loadAudit() {
    try {
      const res = await axiosInstance.get("/audit-logs");
      if (res.success) {
        setAuditLogs(res.data || []);
      }
    } catch (e) {
      console.warn("Audit fetch warning", e);
    }
  }

  useEffect(() => {
    checkHealth();
    loadAudit();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          System Settings & Platform Audit
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Backend server status, automated schedulers, and municipal audit log
          trail
        </p>
      </div>

      {/* Server Status Card */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Node.js Express API Engine
              </h4>
              <p className="text-xs text-slate-500">
                Port 3000 · High-Throughput REST Gateway
              </p>
            </div>
          </div>
          <Button
            size="xs"
            variant="outline"
            colorScheme="gray"
            onClick={checkHealth}
            isLoading={isLoadingHealth}
            leftIcon={<RotateCw className="w-3 h-3" />}
          >
            Ping API
          </Button>
        </div>

        {health && (
          <div className="p-3 bg-slate-900 text-slate-200 rounded-lg text-xs font-mono flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>
                Status:{" "}
                <strong className="text-emerald-400">
                  {health.status?.toUpperCase() || "ONLINE"}
                </strong>
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              {health.service || "ParkGuard API"}
            </span>
          </div>
        )}
      </div>

      {/* MongoDB Database Card */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-green-50 text-green-700 border border-green-200">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">
                  MongoDB Database Engine
                </h4>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-green-100 text-green-800">
                  {dbStatus?.orm || "Mongoose ODM"}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Active Database:{" "}
                <span className="font-mono font-medium text-slate-700">
                  {dbStatus?.activeDatabase || "parkguard"}
                </span>{" "}
                · MONGODB_URI configured
              </p>
            </div>
          </div>
          <Button
            size="xs"
            variant="outline"
            colorScheme="gray"
            onClick={syncDatabase}
            isLoading={isSyncingDb}
            leftIcon={<RotateCw className="w-3 h-3" />}
          >
            Sync / Verify
          </Button>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-700 font-mono text-[11px]">
            <span className="text-slate-500">Storage Mode:</span>
            <span className="font-semibold text-slate-800">
              {dbStatus?.storageMode || "MongoDB Schema Engine"}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-700 font-mono text-[11px]">
            <span className="text-slate-500">Configured URI:</span>
            <span className="text-slate-600 truncate max-w-xs">
              {dbStatus?.configuredUri || "mongodb://localhost:27017/parkguard"}
            </span>
          </div>
        </div>

        {dbStatus?.collections && (
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Synchronized MongoDB Collections
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(dbStatus.collections).map(([coll, count]) => (
                <div
                  key={coll}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-center"
                >
                  <span className="text-base font-bold text-slate-900 block font-mono">
                    {count}
                  </span>
                  <span className="text-[11px] text-slate-500 capitalize">
                    {coll}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Municipal Enforcement Policy Configuration */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          Municipal Enforcement Rules
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="font-semibold text-slate-800 block">
              Default Payment Grace Period
            </span>
            <p className="text-slate-500 mt-0.5">
              21 Calendar Days before late fee escalation
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="font-semibold text-slate-800 block">
              Immobilization Boot Threshold
            </span>
            <p className="text-slate-500 mt-0.5">
              3 or more delinquent / overdue citations
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="font-semibold text-slate-800 block">
              Automated Overdue Escalation Job
            </span>
            <p className="text-slate-500 mt-0.5">
              Runs continuously every 2 minutes in background
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="font-semibold text-slate-800 block">
              Adjudication Appeal Window
            </span>
            <p className="text-slate-500 mt-0.5">
              14 Calendar Days from issuance date
            </p>
          </div>
        </div>
      </div>

      {/* Audit Log Trail */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            Municipal Audit Log Trail
          </h4>
          <span className="text-[11px] text-slate-400 font-mono">
            {auditLogs.length} events logged
          </span>
        </div>

        <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto text-xs">
          {auditLogs.length === 0 ? (
            <div className="p-4 text-center text-slate-400">
              No recent audit records.
            </div>
          ) : (
            auditLogs.slice(0, 10).map((log) => (
              <div
                key={log.id}
                className="p-3 hover:bg-slate-50 flex items-center justify-between gap-4 font-mono text-[11px]"
              >
                <div>
                  <span className="text-blue-700 font-bold mr-2">
                    [{log.action}]
                  </span>
                  <span className="text-slate-800 font-sans">
                    {log.userName || "System"}
                  </span>
                  <span className="text-slate-400 ml-1">
                    ({log.entityType} #{log.entityId})
                  </span>
                </div>
                <span className="text-slate-400 shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
