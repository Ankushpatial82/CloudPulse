# CloudPulse Lightweight Python Monitoring Agent

The CloudPulse agent is a high-performance cross-platform Python service designed to stream host infrastructure telemetry to the CloudPulse backend in real time.

## System Metrics Collected
- **CPU**: Utilization %, Load Average (1m, 5m, 15m), CPU Temperature (if supported)
- **Memory**: Virtual RAM utilization %, Swap Memory %
- **Disk**: Mount point space usage %
- **Network**: Real-time Upload/Download throughput in Kbps
- **System**: Hostname, OS version, System Uptime
- **Processes**: Top active processes sorted by CPU and Memory utilization

## Installation & Setup

1. **Clone Repository & Navigate to Agent**:
```bash
cd agent
```

2. **Create Python Virtual Environment (Recommended)**:
```bash
python3 -m venv venv
source venv/bin/activate
```

3. **Install Dependencies**:
```bash
pip install -r requirements.txt
```

4. **Set Environment Variables**:
```bash
export API_URL="http://localhost:5001"
export AGENT_TOKEN="cp_agent_your_generated_token_here"
export MONITOR_INTERVAL="5"
```

5. **Run Agent**:
```bash
python agent.py
```
