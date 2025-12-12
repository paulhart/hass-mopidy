"""Constants for the Mopidy integration."""
from collections import OrderedDict

DOMAIN = "mopidy-enhanced"
ICON = "mdi:speaker-wireless"
DEFAULT_NAME = "Mopidy Enhanced"
DEFAULT_PORT = 6680
SERVICE_SET_CONSUME_MODE = "set_consume_mode"
SERVICE_SNAPSHOT = "snapshot"
SERVICE_RESTORE = "restore"
SERVICE_SEARCH = "search"
SERVICE_GET_SEARCH_RESULT = "get_search_result"

# Cache configuration
CACHE_MAX_SIZE = 1000  # Maximum entries in cache dictionaries

# Snapshot restore configuration
RESTORE_RETRY_MAX = 120  # Maximum retry attempts for snapshot restore
RESTORE_RETRY_INTERVAL_SECONDS = 0.5  # Sleep interval between retries

# Volume control configuration
VOLUME_STEP_PERCENT = 5  # Volume adjustment step size

# Bounded LRU caches for artwork and titles
CACHE_TITLES: OrderedDict[str, str] = OrderedDict()
CACHE_ART: OrderedDict[str, str | None] = OrderedDict()


def _bounded_cache_set(cache: OrderedDict[str, str | None], key: str, value: str | None) -> None:
    """Set a cache entry with LRU eviction when size limit is reached.
    
    Args:
        cache: The OrderedDict cache to update
        key: Cache key
        value: Cache value (can be None for CACHE_ART)
    
    When cache reaches CACHE_MAX_SIZE, the oldest entry (first item) is evicted.
    New entries are added at the end (most recently used).
    """
    # If key exists, remove it first to update position (move to end)
    if key in cache:
        del cache[key]
    # If cache is at max size, remove oldest entry (first item)
    elif len(cache) >= CACHE_MAX_SIZE:
        cache.popitem(last=False)  # Remove oldest (first) item
    # Add new entry at end (most recently used)
    cache[key] = value


YOUTUBE_URLS = [
    "youtube.com",
    "youtu.be"
]
