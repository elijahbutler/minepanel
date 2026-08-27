"use client";

import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Check, Copy, Globe, Link2, Loader2, Network, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLanguage } from "@/lib/hooks/useLanguage";
import type { ServerEdition } from "@/lib/types/types";
import { mcToast } from "@/lib/utils/minecraft-toast";
import { getAllIPs, getProxyStatus, getServerProxyHostname } from "@/services/network.service";

interface ServerConnectionInfoProps {
  readonly port: string;
  readonly serverId: string;
  readonly edition?: ServerEdition;
}

interface ConnectionAddress {
  readonly id: string;
  readonly label: string;
  readonly address: string;
  readonly icon: LucideIcon;
}

function formatDirectAddress(host: string, port: string): string {
  const normalizedHost = host.includes(":") && !host.startsWith("[") ? `[${host}]` : host;
  return port ? `${normalizedHost}:${port}` : normalizedHost;
}

export function ServerConnectionInfo({ port, serverId, edition }: ServerConnectionInfoProps) {
  const { t } = useLanguage();
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [publicIP, setPublicIP] = useState<string | null>(null);
  const [localIPs, setLocalIPs] = useState<string[]>([]);
  const [proxyAddress, setProxyAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      setPublicIP(null);
      setLocalIPs([]);
      setProxyAddress(null);

      try {
        const [ipData, proxyStatus] = await Promise.all([getAllIPs(), getProxyStatus()]);
        const supportsProxy = edition !== "BEDROCK";
        const hostname =
          supportsProxy && proxyStatus.enabled && proxyStatus.baseDomain
            ? await getServerProxyHostname(serverId)
            : null;
        const address =
          hostname && proxyStatus.proxyPort && proxyStatus.proxyPort !== "25565"
            ? formatDirectAddress(hostname, proxyStatus.proxyPort)
            : hostname;

        if (!cancelled) {
          setPublicIP(ipData.publicIP);
          setLocalIPs(ipData.localIPs);
          setProxyAddress(address);
        }
      } catch (error) {
        console.error("Error fetching server addresses:", error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void fetchData();

    return () => {
      cancelled = true;
    };
  }, [edition, serverId]);

  const addresses = useMemo<ConnectionAddress[]>(() => {
    const options: ConnectionAddress[] = [];

    if (proxyAddress) {
      options.push({
        id: "proxy",
        label: t("proxyAddress"),
        address: proxyAddress,
        icon: Network,
      });
    }

    if (publicIP) {
      options.push({
        id: "public",
        label: t("globalIP"),
        address: formatDirectAddress(publicIP, port),
        icon: Globe,
      });
    }

    const uniqueLocalIPs = localIPs.filter(
      (localIP, index) => localIP !== publicIP && localIPs.indexOf(localIP) === index,
    );
    uniqueLocalIPs.forEach((localIP, index) => {
      options.push({
        id: `local-${localIP}`,
        label: uniqueLocalIPs.length > 1 ? `${t("lanIP")} ${index + 1}` : t("lanIP"),
        address: formatDirectAddress(localIP, port),
        icon: Wifi,
      });
    });

    return options;
  }, [localIPs, port, proxyAddress, publicIP, t]);

  const preferredAddress = addresses[0];

  const copyToClipboard = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      window.setTimeout(() => setCopiedAddress((current) => (current === address ? null : current)), 2000);
      mcToast.success(t("copiedToClipboard"));
    } catch (error) {
      console.error("Error copying server address:", error);
      mcToast.error(t("copyError"));
    }
  };

  const tooltipText = isLoading
    ? t("serverConnection")
    : preferredAddress
      ? t("copyServerAddress")
      : t("serverAddressUnavailable");

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={isLoading || addresses.length === 0}
              aria-label={tooltipText}
              className="h-8 w-8 shrink-0 border-emerald-700/50 bg-gray-800/60 text-emerald-300 hover:border-emerald-500/70 hover:bg-emerald-600/20 hover:text-emerald-200"
            >
              {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2 className="h-3.5 w-3.5" />}
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent className="max-w-72 border border-gray-700 bg-gray-900 text-gray-100">
          <p>{tooltipText}</p>
          {preferredAddress && <p className="mt-1 font-mono text-[10px] text-emerald-300">{preferredAddress.address}</p>}
        </TooltipContent>
      </Tooltip>

      <DropdownMenuContent
        align="start"
        className="w-[min(22rem,calc(100vw-2rem))] border-gray-700 bg-gray-900 p-1.5 text-gray-100"
      >
        <DropdownMenuLabel className="px-2 py-1 text-xs font-minecraft uppercase tracking-wide text-emerald-300">
          {t("serverConnection")}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-700" />
        {addresses.map(({ id, label, address, icon: Icon }) => (
          <DropdownMenuItem
            key={id}
            onSelect={() => void copyToClipboard(address)}
            className="gap-2 rounded-none px-2 py-2 focus:bg-emerald-900/40 focus:text-white"
          >
            <Icon className="h-4 w-4 shrink-0 text-emerald-300" />
            <span className="min-w-0 flex-1">
              <span className="block text-xs text-gray-400">{label}</span>
              <span className="block truncate font-mono text-xs text-gray-100">{address}</span>
            </span>
            {copiedAddress === address ? (
              <Check className="h-4 w-4 shrink-0 text-emerald-300" />
            ) : (
              <Copy className="h-4 w-4 shrink-0 text-gray-500" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
