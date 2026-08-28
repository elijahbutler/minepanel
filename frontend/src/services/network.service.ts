import api from './axios.service';

export interface NetworkInfo {
  hostname: string;
  localIPs: string[];
  publicIP: string | null;
}

export interface PublicIPResponse {
  ip: string;
}

function getBrowserLanAddress(): string | null {
  if (typeof window === 'undefined') return null;

  const hostname = window.location.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  const octets = hostname.split('.').map(Number);
  const isPrivateIPv4 =
    octets.length === 4 &&
    octets.every((octet) => Number.isInteger(octet) && octet >= 0 && octet <= 255) &&
    (octets[0] === 10 ||
      (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
      (octets[0] === 192 && octets[1] === 168));
  const isPrivateIPv6 = /^(?:fc|fd|fe[89ab])/.test(hostname);

  return isPrivateIPv4 || isPrivateIPv6 || hostname.endsWith('.local') ? hostname : null;
}

export async function getServerNetworkInfo(): Promise<NetworkInfo> {
  try {
    const response = await api.get<NetworkInfo>('/system/network');
    return response.data;
  } catch (error) {
    console.error('Error fetching server network info:', error);
    throw error;
  }
}

export async function getPublicIP(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data: PublicIPResponse = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error fetching public IP:', error);
    try {
      const response = await fetch('https://api.my-ip.io/ip');
      const ip = await response.text();
      return ip.trim();
    } catch (fallbackError) {
      console.error('Error with fallback IP service:', fallbackError);
      throw new Error('Unable to fetch public IP');
    }
  }
}

export async function getAllIPs(): Promise<{
  publicIP: string | null;
  localIPs: string[];
  hostname: string;
}> {
  let networkInfo: NetworkInfo = { hostname: '', localIPs: [], publicIP: null };

  try {
    networkInfo = await getServerNetworkInfo();
  } catch (error) {
    console.error('Error fetching all IPs:', error);
  }

  let publicIP: string | null = networkInfo.publicIP;
  if (!publicIP) {
    try {
      publicIP = await getPublicIP();
    } catch {
      publicIP = null;
    }
  }

  const localIPs = [...networkInfo.localIPs];
  const browserLanAddress = getBrowserLanAddress();
  if (browserLanAddress && !localIPs.includes(browserLanAddress)) {
    localIPs.push(browserLanAddress);
  }

  return {
    publicIP,
    localIPs,
    hostname: networkInfo.hostname,
  };
}

export interface ProxyStatus {
  available: boolean;
  enabled: boolean;
  baseDomain: string | null;
  /** Host port the mc-router container publishes. */
  proxyPort?: string;
  autoScaleAvailable?: boolean;
  /** Whether the mc-router container is actually up. */
  running?: boolean;
  routesCount?: number;
}

export async function getProxyStatus(): Promise<ProxyStatus> {
  try {
    const response = await api.get<ProxyStatus>('/proxy/status');
    return response.data;
  } catch {
    // `running` stays undefined: reporting false here would make the UI claim the
    // router is stopped when it just could not be reached.
    return { available: false, enabled: false, baseDomain: null, autoScaleAvailable: false };
  }
}

export interface ProxyMapping {
  host: string;
  backend: string;
}

export async function getProxyMappings(): Promise<ProxyMapping[]> {
  try {
    const response = await api.get<ProxyMapping[]>('/proxy/mappings');
    return response.data;
  } catch {
    return [];
  }
}

export async function getServerProxyHostname(serverId: string): Promise<string | null> {
  try {
    const response = await api.get<{ hostname: string | null }>(
      `/proxy/server/${serverId}/hostname`,
    );
    return response.data.hostname;
  } catch {
    return null;
  }
}

export async function regenerateAllDockerCompose(): Promise<{
  success: boolean;
  updated: string[];
  errors: string[];
}> {
  try {
    const response = await api.post<{ success: boolean; updated: string[]; errors: string[] }>(
      '/servers/regenerate-all',
    );
    return response.data;
  } catch {
    return { success: false, updated: [], errors: [] };
  }
}
