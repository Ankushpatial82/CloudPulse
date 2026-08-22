export interface DemoServer {
  id: string;
  name: string;
  hostname: string;
  ipAddress: string;
  os: string;
  status: "ONLINE" | "WARNING" | "CRITICAL" | "OFFLINE";
  healthScore: number;
  cpu: number;
  ram: number;
  disk: number;
  netUp: number;
  netDown: number;
  uptime: string;
  lastSeen: string;
  activeAlertsCount: number;
}

export const DEMO_SERVERS: DemoServer[] = [
  {
    id: "srv-us-east-prod-01",
    name: "us-east-prod-01",
    hostname: "prod-node-01.us-east.cloudpulse.net",
    ipAddress: "192.168.10.45",
    os: "Ubuntu 24.04 LTS",
    status: "ONLINE",
    healthScore: 96,
    cpu: 34.2,
    ram: 62.4,
    disk: 48.1,
    netUp: 4.8,
    netDown: 14.2,
    uptime: "18d 14h 22m",
    lastSeen: "2s ago",
    activeAlertsCount: 0,
  },
  {
    id: "srv-eu-west-db-02",
    name: "eu-west-db-cluster-02",
    hostname: "pg-master.eu-west.cloudpulse.net",
    ipAddress: "10.0.12.89",
    os: "Debian 12 Bookworm",
    status: "WARNING",
    healthScore: 78,
    cpu: 82.5,
    ram: 88.1,
    disk: 79.4,
    netUp: 22.4,
    netDown: 45.1,
    uptime: "45d 02h 10m",
    lastSeen: "1s ago",
    activeAlertsCount: 1,
  },
  {
    id: "srv-ap-south-k8s-master",
    name: "ap-south-k8s-control-01",
    hostname: "k8s-master.ap-south.cloudpulse.net",
    ipAddress: "172.16.4.12",
    os: "Alpine Linux 3.19",
    status: "ONLINE",
    healthScore: 98,
    cpu: 18.6,
    ram: 41.2,
    disk: 32.0,
    netUp: 8.1,
    netDown: 11.5,
    uptime: "92d 11h 05m",
    lastSeen: "4s ago",
    activeAlertsCount: 0,
  },
  {
    id: "srv-us-west-api-gateway",
    name: "us-west-api-gateway-03",
    hostname: "kong-gw.us-west.cloudpulse.net",
    ipAddress: "192.168.20.104",
    os: "Ubuntu 22.04 LTS",
    status: "CRITICAL",
    healthScore: 42,
    cpu: 94.8,
    ram: 91.5,
    disk: 88.9,
    netUp: 68.2,
    netDown: 112.4,
    uptime: "3d 08h 14m",
    lastSeen: "1s ago",
    activeAlertsCount: 3,
  },
  {
    id: "srv-sa-east-staging-01",
    name: "sa-east-staging-node",
    hostname: "staging.sa-east.cloudpulse.net",
    ipAddress: "10.200.5.33",
    os: "RedHat Enterprise 9",
    status: "OFFLINE",
    healthScore: 0,
    cpu: 0,
    ram: 0,
    disk: 54.0,
    netUp: 0,
    netDown: 0,
    uptime: "0m",
    lastSeen: "24h ago",
    activeAlertsCount: 1,
  },
];

export const DEMO_ALERTS = [
  {
    id: "alt-101",
    serverName: "us-west-api-gateway-03",
    hostname: "kong-gw.us-west.cloudpulse.net",
    metricType: "CPU",
    currentValue: 94.8,
    thresholdValue: 90.0,
    severity: "CRITICAL",
    status: "ACTIVE",
    message: "CPU utilization exceeded 90.0% critical threshold (94.8%)",
    triggeredAt: "3 minutes ago",
  },
  {
    id: "alt-102",
    serverName: "us-west-api-gateway-03",
    hostname: "kong-gw.us-west.cloudpulse.net",
    metricType: "MEMORY",
    currentValue: 91.5,
    thresholdValue: 85.0,
    severity: "CRITICAL",
    status: "ACTIVE",
    message: "Memory utilization exceeded 85.0% threshold (91.5%)",
    triggeredAt: "12 minutes ago",
  },
  {
    id: "alt-103",
    serverName: "eu-west-db-cluster-02",
    hostname: "pg-master.eu-west.cloudpulse.net",
    metricType: "MEMORY",
    currentValue: 88.1,
    thresholdValue: 85.0,
    severity: "WARNING",
    status: "ACTIVE",
    message: "High memory consumption on DB primary cluster (88.1%)",
    triggeredAt: "45 minutes ago",
  },
  {
    id: "alt-104",
    serverName: "sa-east-staging-node",
    hostname: "staging.sa-east.cloudpulse.net",
    metricType: "OFFLINE",
    currentValue: 0,
    thresholdValue: 1,
    severity: "WARNING",
    status: "ACTIVE",
    message: "Monitoring agent disconnected, server unreachable",
    triggeredAt: "1 day ago",
  },
];

export const DEMO_PROCESSES = [
  { pid: 1420, name: "postgres: writer process", cpuPercent: 38.4, memoryPercent: 24.1, status: "running", username: "postgres", server: "eu-west-db-cluster-02" },
  { pid: 3892, name: "node /app/server.js", cpuPercent: 28.2, memoryPercent: 18.5, status: "running", username: "node", server: "us-west-api-gateway-03" },
  { pid: 812, name: "nginx: worker process", cpuPercent: 14.8, memoryPercent: 4.2, status: "running", username: "www-data", server: "us-east-prod-01" },
  { pid: 512, name: "dockerd --group docker", cpuPercent: 9.1, memoryPercent: 12.0, status: "running", username: "root", server: "ap-south-k8s-control-01" },
  { pid: 2104, name: "redis-server *:6379", cpuPercent: 4.5, memoryPercent: 8.6, status: "running", username: "redis", server: "us-east-prod-01" },
  { pid: 9811, name: "python3 agent.py", cpuPercent: 0.8, memoryPercent: 1.2, status: "running", username: "cloudpulse", server: "us-east-prod-01" },
];

export function generateHistoricalMetricsData(points = 24) {
  const data = [];
  const now = Date.now();
  const step = (60 * 60 * 1000) / points; // hourly

  for (let i = points; i >= 0; i--) {
    const t = new Date(now - i * step);
    const timeStr = t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Sinusoidal deterministic variation
    const phase = i / 3;
    const cpu = Math.max(12, Math.min(95, 42 + Math.sin(phase) * 22 + (i % 2 === 0 ? 5 : -3)));
    const ram = Math.max(20, Math.min(92, 58 + Math.cos(phase * 0.8) * 15));
    const disk = Math.min(85, 45 + (points - i) * 0.4);
    const upload = Math.max(1.2, 5 + Math.sin(phase * 1.2) * 4);
    const download = Math.max(3.5, 16 + Math.cos(phase * 1.5) * 12);
    const load1 = Math.max(0.4, parseFloat((cpu / 25).toFixed(2)));

    data.push({
      timestamp: timeStr,
      cpuUsage: Math.round(cpu * 10) / 10,
      memoryUsage: Math.round(ram * 10) / 10,
      diskUsage: Math.round(disk * 10) / 10,
      networkUploadKbps: Math.round(upload * 100) / 10,
      networkDownloadKbps: Math.round(download * 100) / 10,
      loadAvg1: parseFloat(load1 as any),
    });
  }

  return data;
}
