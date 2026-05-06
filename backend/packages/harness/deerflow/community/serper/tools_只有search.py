import json
import httpx
from typing import Dict, Any

from langchain.tools import tool

from deerflow.config import get_app_config


def _get_serper_config() -> tuple[str | None, int]:
    """Get Serper API configuration from app config.
    
    Returns:
        tuple: (api_key, max_results)
    """
    config = get_app_config().get_tool_config("web_search")
    api_key = None
    max_results = 5
    if config is not None and config.model_extra:
        if "api_key" in config.model_extra:
            api_key = config.model_extra.get("api_key")
        if "max_results" in config.model_extra:
            max_results = config.model_extra.get("max_results")
    return api_key, max_results


async def _serper_search(query: str, num_results: int, api_key: str) -> Dict[str, Any]:
    """Internal function to search using Serper API."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            "https://google.serper.dev/search",
            headers={
                "X-API-KEY": api_key,
                "Content-Type": "application/json"
            },
            json={
                "q": query,
                "num": min(num_results, 50),
                "gl": "cn",
                "hl": "zh-cn"
            }
        )
        
        if response.status_code != 200:
            raise Exception(f"Serper API error: {response.status_code}")
        
        return response.json()


@tool("web_search", parse_docstring=True)
def web_search_tool(query: str) -> str:
    """Search the web using Serper API.

    Args:
        query: The query to search for.
    """
    api_key, max_results = _get_serper_config()
    
    if not api_key:
        raise ValueError("Serper API key is not configured")
    
    import asyncio
    res = asyncio.run(_serper_search(query, max_results, api_key))
    
    normalized_results = [
        {
            "title": result.get("title", ""),
            "url": result.get("link", ""),
            "snippet": result.get("snippet", ""),
        }
        for result in res.get("organic", [])[:max_results]
    ]
    
    json_results = json.dumps(normalized_results, indent=2, ensure_ascii=False)
    return json_results