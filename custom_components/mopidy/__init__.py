"""The mopidy component."""
import logging
from typing import Any

from mopidyapi import MopidyAPI
from requests.exceptions import ConnectionError as reConnectionError

from homeassistant.components.media_player import DOMAIN as MEDIA_PLAYER_DOMAIN
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_HOST, CONF_PORT
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryNotReady

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)


async def async_setup(hass: HomeAssistant, config: dict[str, Any]) -> bool:
    """Set up the mopidy component."""
    return True


def _test_connection(host: str, port: int) -> bool:
    client = MopidyAPI(
        host=host,
        port=port,
        use_websocket=False,
        logger=logging.getLogger(__name__ + ".client"),
    )
    client.rpc_call("core.get_version")
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up the mopidy from a config entry."""
    host = entry.data[CONF_HOST]
    port = entry.data[CONF_PORT]
    try:
        await hass.async_add_executor_job(
            _test_connection, host, port
        )

    except reConnectionError as error:
        _LOGGER.error(
            "Cannot connect to Mopidy server at %s:%d during setup",
            host,
            port
        )
        raise ConfigEntryNotReady(
            f"Cannot connect to Mopidy server at {host}:{port}"
        ) from error

    hass.data.setdefault(DOMAIN, {})

    await hass.config_entries.async_forward_entry_setups(entry, [MEDIA_PLAYER_DOMAIN])
    return True
