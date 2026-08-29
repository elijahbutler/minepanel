import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, FolderOpen, PowerIcon, RefreshCw, Trash2, Zap } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ServerConnectionInfo } from "@/components/molecules/ServerConnectionInfo";
import { ServerRuntimeChips } from "@/components/molecules/ServerRuntimeChips";
import { useLanguage } from "@/lib/hooks/useLanguage";
import type { ServerEdition } from "@/lib/types/types";
import { getStatusBadgeClass } from "@/lib/utils/server-status";

interface ServerPageHeaderProps {
  readonly serverId: string;
  readonly serverName: string;
  readonly serverStatus: string;
  readonly serverPort: string;
  readonly serverEdition?: ServerEdition;
  readonly isProcessing: boolean;
  readonly onStartServer: () => Promise<boolean>;
  readonly onStopServer: () => Promise<boolean>;
  readonly onForceStopServer: () => Promise<boolean>;
  readonly onRestartServer: () => Promise<boolean>;
  readonly onClearData: () => Promise<boolean>;
  readonly onOpenFiles?: () => void;
}

export function ServerPageHeader({ serverId, serverName, serverStatus, serverPort, serverEdition, isProcessing, onStartServer, onStopServer, onForceStopServer, onRestartServer, onClearData, onOpenFiles }: ServerPageHeaderProps) {
  const { t } = useLanguage();
  const [isClearing, setIsClearing] = useState(false);
  const displayName = serverName || serverId;
  const isRunningOrStarting = serverStatus === "running" || serverStatus === "starting";

  const handleClearData = async () => {
    setIsClearing(true);
    try {
      await onClearData();
    } finally {
      setIsClearing(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "running":
        return t("active");
      case "starting":
        return t("starting2");
      case "stopped":
        return t("stopped2");
      case "not_found":
        return t("notFound");
      default:
        return t("unknown");
    }
  };

  return (
    <div className="mc-panel p-3 text-white sm:p-4">
      <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-2.5 sm:items-center">
          <Link href="/dashboard/servers" className="shrink-0">
            <Button
              variant="outline"
              size="icon"
              type="button"
              aria-label={t("back")}
              className="h-9 w-9 border-gray-700/50 bg-gray-800/40 text-white hover:border-emerald-600/50 hover:bg-emerald-600/20 hover:text-emerald-300"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex min-w-0 items-center gap-2">
              <h1 className="min-w-0 flex-1 truncate text-lg font-bold tracking-tight text-white font-minecraft sm:text-xl 2xl:text-2xl" title={serverId}>
                {displayName}
              </h1>

              {serverStatus === "running" && (
                <ServerConnectionInfo port={serverPort} serverId={serverId} edition={serverEdition} />
              )}

              <Badge variant="outline" className={`shrink-0 px-2 py-0.5 text-[10px] sm:text-xs ${getStatusBadgeClass(serverStatus)}`}>
                {serverStatus === "starting" ? (
                  <span className="flex items-center gap-1">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    {getStatusText(serverStatus)}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {getStatusText(serverStatus)}
                  </span>
                )}
              </Badge>
            </div>

            {serverStatus === "running" && <ServerRuntimeChips serverId={serverId} serverStatus={serverStatus} />}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:pl-11 2xl:ml-auto 2xl:pl-0">
          {isRunningOrStarting ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onStopServer}
              aria-label={t("stopServer")}
              title={t("stopServer")}
              className="h-9 gap-2 bg-red-600 px-2.5 text-white hover:bg-red-700 sm:px-3"
            >
              <PowerIcon className="h-4 w-4" />
              <span className="hidden font-minecraft sm:inline">{t("stopServer")}</span>
            </Button>
          ) : (
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={onStartServer}
              aria-label={t("startServer")}
              title={t("startServer")}
              className="h-9 gap-2 bg-emerald-600 px-2.5 text-white hover:bg-emerald-700 sm:px-3"
            >
              <PowerIcon className="h-4 w-4" />
              <span className="hidden font-minecraft sm:inline">{t("startServer")}</span>
            </Button>
          )}

          {isRunningOrStarting && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isProcessing}
                  aria-label={t("forceStopServer")}
                  title={t("forceStopServer")}
                  className="h-9 gap-2 border-amber-700/50 bg-gray-800/40 px-2.5 text-amber-300 hover:border-amber-600/50 hover:bg-amber-600/20 hover:text-amber-200 xl:px-3"
                >
                  <Zap className="h-4 w-4" />
                  <span className="hidden font-minecraft xl:inline">{t("forceStopServer")}</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="border-gray-700 bg-gray-900">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-amber-400 font-minecraft">{t("forceStopConfirmTitle")}</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-300">{t("forceStopConfirmDesc")}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600">{t("cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={onForceStopServer} disabled={isProcessing} className="border-amber-900/50 bg-amber-700 text-white hover:bg-amber-800 font-minecraft">
                    {t("forceStopServer")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRestartServer}
            disabled={isProcessing || serverStatus !== "running"}
            aria-label={isProcessing ? t("restarting") : t("restart2")}
            title={isProcessing ? t("restarting") : t("restart2")}
            className="h-9 gap-2 border-gray-700/50 bg-gray-800/40 px-2.5 text-white hover:border-orange-600/50 hover:bg-orange-600/20 hover:text-orange-300 xl:px-3"
          >
            <RefreshCw className={`h-4 w-4 ${isProcessing ? "animate-spin" : ""}`} />
            <span className="hidden xl:inline">{isProcessing ? t("restarting") : t("restart2")}</span>
          </Button>

          {onOpenFiles && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenFiles}
              aria-label={t("files")}
              title={t("files")}
              className="h-9 gap-2 border-gray-700/50 bg-gray-800/40 px-2.5 text-white hover:border-blue-600/50 hover:bg-blue-600/20 hover:text-blue-300 xl:px-3"
            >
              <FolderOpen className="h-4 w-4" />
              <span className="hidden xl:inline">{t("files")}</span>
            </Button>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={isRunningOrStarting}
                aria-label={t("deleteConfirmTitle")}
                title={t("deleteConfirmTitle")}
                className="h-9 w-9 border-red-700/50 bg-red-900/20 text-red-400 hover:border-red-600/50 hover:bg-red-600/30 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-gray-700 bg-gray-900">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-red-400 font-minecraft">{t("deleteConfirmTitle")}</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-300">{t("deleteConfirmDesc")}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600">{t("cancel")}</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearData} disabled={isClearing} className="border-red-900/50 bg-red-700 text-white hover:bg-red-800 font-minecraft">
                  {isClearing ? t("deleting") : t("yesDeleteAll")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
