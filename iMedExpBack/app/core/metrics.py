import re
import threading
import time
from collections import defaultdict


_DYNAMIC_SEGMENT_RE = re.compile(
    r"^(\d+|[0-9a-fA-F]{8,}|[0-9a-fA-F-]{32,})$"
)


class MetricsCollector:
    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._started_at = time.time()
        self._requests: dict[tuple[str, str, int], int] = defaultdict(int)
        self._duration_count: dict[tuple[str, str], int] = defaultdict(int)
        self._duration_sum: dict[tuple[str, str], float] = defaultdict(float)

    def record(self, method: str, path: str, status_code: int, duration_seconds: float) -> None:
        route = normalize_path(path)
        method = method.upper()
        with self._lock:
            self._requests[(method, route, status_code)] += 1
            self._duration_count[(method, route)] += 1
            self._duration_sum[(method, route)] += max(0.0, duration_seconds)

    def reset(self) -> None:
        with self._lock:
            self._requests.clear()
            self._duration_count.clear()
            self._duration_sum.clear()
            self._started_at = time.time()

    def render(self) -> str:
        with self._lock:
            lines = [
                "# HELP imedexp_process_start_time_seconds Unix timestamp when the API process started.",
                "# TYPE imedexp_process_start_time_seconds gauge",
                f"imedexp_process_start_time_seconds {self._started_at:.0f}",
                "# HELP imedexp_http_requests_total Total HTTP requests by method, route, and status.",
                "# TYPE imedexp_http_requests_total counter",
            ]
            for (method, route, status), count in sorted(self._requests.items()):
                lines.append(
                    "imedexp_http_requests_total"
                    f'{{method="{_escape(method)}",route="{_escape(route)}",status="{status}"}} {count}'
                )

            lines.extend([
                "# HELP imedexp_http_request_duration_seconds Request duration summary by method and route.",
                "# TYPE imedexp_http_request_duration_seconds summary",
            ])
            for (method, route), count in sorted(self._duration_count.items()):
                duration_sum = self._duration_sum[(method, route)]
                labels = f'method="{_escape(method)}",route="{_escape(route)}"'
                lines.append(
                    f"imedexp_http_request_duration_seconds_count{{{labels}}} {count}"
                )
                lines.append(
                    f"imedexp_http_request_duration_seconds_sum{{{labels}}} {duration_sum:.6f}"
                )
        return "\n".join(lines) + "\n"


def normalize_path(path: str) -> str:
    parts = [part for part in path.split("/") if part]
    if not parts:
        return "/"
    normalized = [
        "{id}" if _DYNAMIC_SEGMENT_RE.match(part) else part[:80]
        for part in parts[:12]
    ]
    return "/" + "/".join(normalized)


def _escape(value: str) -> str:
    return value.replace("\\", "\\\\").replace("\n", "\\n").replace('"', '\\"')


metrics_collector = MetricsCollector()
