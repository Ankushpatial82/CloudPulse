import os
import sys

# Load configurations from environment variables or fallback defaults
API_URL = os.getenv("API_URL", "http://localhost:5002")
AGENT_TOKEN = os.getenv("AGENT_TOKEN", "your-agent-token-here")
MONITOR_INTERVAL = int(os.getenv("MONITOR_INTERVAL", "5"))
