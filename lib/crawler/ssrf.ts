import { isIP } from "net";

const BLOCKED_HOSTNAMES = [
  /^localhost$/i,
  /^127\.\d+\.\d+\.\d+$/,
  /^0\.0\.0\.0$/,
  /^10\.\d+\.\d+\.\d+$/,
  /^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/,
  /^192\.168\.\d+\.\d+$/,
  /^169\.254\.\d+\.\d+$/,
  /^\[::1\]$/,
  /^::1$/,
];

function isPrivateIp(ip: string): boolean {
  if (!isIP(ip)) return false;
  if (ip === "127.0.0.1" || ip === "0.0.0.0" || ip === "::1") return true;
  if (ip.startsWith("10.")) return true;
  if (ip.startsWith("192.168.")) return true;
  if (ip.startsWith("169.254.")) return true;
  const parts = ip.split(".").map(Number);
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  return false;
}

export async function assertSafeUrl(raw: string): Promise<URL> {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error("INVALID_URL");

  const withProtocol = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
  let url: URL;

  try {
    url = new URL(withProtocol);
  } catch {
    throw new Error("INVALID_URL");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("INVALID_SCHEME");
  }

  const hostname = url.hostname.toLowerCase();

  if (BLOCKED_HOSTNAMES.some((r) => r.test(hostname))) {
    throw new Error("BLOCKED_HOST");
  }

  if (isIP(hostname) && isPrivateIp(hostname)) {
    throw new Error("BLOCKED_IP");
  }

  return url;
}
