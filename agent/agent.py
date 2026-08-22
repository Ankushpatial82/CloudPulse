import time
import requests
import sys
import logging
from config import API_URL, AGENT_TOKEN, MONITOR_INTERVAL
from metrics import MetricsCollector

logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

def main():
    logging.info("=" * 60)
    logging.info(" 🚀 Starting CloudPulse Python Monitoring Agent")
    logging.info(f" 📡 API Target: {API_URL}")
    logging.info(f" ⏱️ Collection Interval: {MONITOR_INTERVAL}s")
    logging.info("=" * 60)

    if AGENT_TOKEN == "your-agent-token-here":
        logging.warning("⚠️ Warning: AGENT_TOKEN is set to default placeholder. Ensure you configure AGENT_TOKEN from the CloudPulse Dashboard.")

    collector = MetricsCollector()
    ingest_url = f"{API_URL}/api/metrics/ingest"

    while True:
        try:
            metrics = collector.collect_metrics()
            payload = {
                'agentToken': AGENT_TOKEN,
                **metrics
            }

            headers = {
                'Content-Type': 'application/json',
                'X-Agent-Token': AGENT_TOKEN
            }

            response = requests.post(ingest_url, json=payload, headers=headers, timeout=5)

            if response.status_code == 201:
                logging.info(f"✅ Metrics sent successfully. CPU: {metrics['cpuUsage']}% | RAM: {metrics['memoryUsage']}% | Disk: {metrics['diskUsage']}%")
            elif response.status_code == 401:
                logging.error("❌ Agent Authentication Failed. Please verify your AGENT_TOKEN.")
            else:
                logging.warning(f"⚠️ API returned status {response.status_code}: {response.text}")

        except requests.exceptions.RequestException as e:
            logging.error(f"❌ Network Error connecting to CloudPulse API: {e}")
        except Exception as e:
            logging.error(f"❌ Unexpected Agent Exception: {e}")

        time.sleep(MONITOR_INTERVAL)

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        logging.info("Agent stopped by user.")
        sys.exit(0)
