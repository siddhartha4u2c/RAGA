"""Gunicorn config: bind to PORT from environment (required by Render)."""
import os

bind = f"0.0.0.0:{os.environ.get('PORT', '10000')}"
workers = 1
timeout = 120
worker_class = "sync"
# Load app before forking so workers respond immediately (avoids "No open HTTP ports" on Render)
preload_app = True
