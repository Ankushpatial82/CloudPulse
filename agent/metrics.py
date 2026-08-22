import time
import platform
import psutil

class MetricsCollector:
    def __init__(self):
        self.last_net_io = psutil.net_io_counters()
        self.last_time = time.time()

    def collect_metrics(self):
        now = time.time()
        time_delta = max(now - self.last_time, 0.001)

        # CPU Usage
        cpu_usage = psutil.cpu_percent(interval=None)

        # Memory Usage
        mem = psutil.virtual_memory()
        memory_usage = mem.percent

        # Swap Usage
        swap = psutil.swap_memory()
        swap_usage = swap.percent

        # Disk Usage
        disk = psutil.disk_usage('/')
        disk_usage = disk.percent

        # Network Traffic (Kbps calculation)
        curr_net_io = psutil.net_io_counters()
        bytes_sent = curr_net_io.bytes_sent - self.last_net_io.bytes_sent
        bytes_recv = curr_net_io.bytes_recv - self.last_net_io.bytes_recv

        network_upload_kbps = max(0.0, (bytes_sent * 8 / 1024) / time_delta)
        network_download_kbps = max(0.0, (bytes_recv * 8 / 1024) / time_delta)

        self.last_net_io = curr_net_io
        self.last_time = now

        # System Uptime
        uptime_sec = time.time() - psutil.boot_time()

        # Load Averages
        try:
            load_1, load_5, load_15 = psutil.getloadavg()
        except (AttributeError, OSError):
            load_1, load_5, load_15 = 0.0, 0.0, 0.0

        # CPU Temperature if available
        temperature = None
        try:
            temps = psutil.sensors_temperatures()
            if temps:
                for name, entries in temps.items():
                    if entries:
                        temperature = entries[0].current
                        break
        except Exception:
            temperature = None

        # Top processes by CPU/Memory usage
        processes = []
        try:
            for p in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent', 'status', 'username']):
                try:
                    info = p.info
                    processes.append({
                        'pid': info['pid'],
                        'name': info['name'] or 'unknown',
                        'cpuPercent': round(info['cpu_percent'] or 0.0, 1),
                        'memoryPercent': round(info['memory_percent'] or 0.0, 1),
                        'status': info['status'] or 'running',
                        'username': info['username'] or 'system'
                    })
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    continue
        except Exception:
            pass

        # Sort top 15 processes by CPU usage
        processes = sorted(processes, key=lambda x: x['cpuPercent'], reverse=True)[:15]

        return {
            'cpuUsage': round(cpu_usage, 1),
            'memoryUsage': round(memory_usage, 1),
            'swapUsage': round(swap_usage, 1),
            'diskUsage': round(disk_usage, 1),
            'networkUploadKbps': round(network_upload_kbps, 1),
            'networkDownloadKbps': round(network_download_kbps, 1),
            'loadAvg1': round(load_1, 2),
            'loadAvg5': round(load_5, 2),
            'loadAvg15': round(load_15, 2),
            'temperature': round(temperature, 1) if temperature is not None else None,
            'uptimeSec': round(uptime_sec),
            'processCount': len(processes),
            'processes': processes,
            'hostname': platform.node(),
            'os': platform.system(),
            'osVersion': platform.release()
        }
