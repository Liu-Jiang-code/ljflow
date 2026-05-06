import json
import httpx
import asyncio
from typing import Dict, Any
from langchain.tools import tool
from deerflow.config import get_app_config

# ===================== 全局配置复用 =====================
def _get_serper_config() -> tuple[str | None, int]:
    """复用Serper配置：读取API Key和最大结果数"""
    config = get_app_config().get_tool_config("web_search")
    api_key = None
    max_results = 5
    if config is not None and config.model_extra:
        api_key = config.model_extra.get("api_key")
        max_results = config.model_extra.get("max_results", max_results)
    return api_key, max_results

# ===================== 1. 网页搜索（你已有的，保留优化） =====================
async def _serper_search(query: str, num_results: int, api_key: str) -> Dict[str, Any]:
    async with httpx.AsyncClient(timeout=5.0) as client:
        response = await client.post(
            "https://google.serper.dev/search",
            headers={"X-API-KEY": api_key, "Content-Type": "application/json"},
            json={"q": query, "num": min(num_results, 50), "gl": "cn", "hl": "zh-cn"}
        )
        response.raise_for_status()
        return response.json()

@tool("web_search", parse_docstring=True)
def web_search_tool(query: str) -> str:
    """Search the web using Serper API.

    Args:
        query: The query to search for.
    """
    api_key, max_results = _get_serper_config()
    if not api_key:
        raise ValueError("Serper API key 未配置")
    
    res = asyncio.run(_serper_search(query, max_results, api_key))
    normalized_results = [
        {
            "title": result.get("title", ""),
            "url": result.get("link", ""),
            "snippet": result.get("snippet", "")
        }
        for result in res.get("organic", [])[:max_results]
    ]
    return json.dumps(normalized_results, indent=2, ensure_ascii=False)

# ===================== 2. 网页抓取（新增：Serper 官方Scrape API） =====================
async def _serper_fetch(url: str, api_key: str) -> str:
    """Serper 官方网页全文抓取，返回Markdown"""
    async with httpx.AsyncClient(timeout=5.0) as client:
        response = await client.post(
            "https://scrape.serper.dev/search",
            headers={"X-API-KEY": api_key, "Content-Type": "application/json"},
            json={"url": url, "include_markdown": True}
        )
        if response.status_code != 200:
            return f"Error: 抓取失败 {response.status_code}"
        data = response.json()
        return data.get("markdown", data.get("text", "未获取到内容"))

@tool("web_fetch", parse_docstring=True)
def web_fetch_tool(url: str) -> str:
    """Fetch the contents of a web page using Serper Scrape API.

    Args:
        url: The URL to fetch (must start with https://)
    """
    api_key, _ = _get_serper_config()
    if not api_key:
        return "Error: Serper API key 未配置"
    
    content = asyncio.run(_serper_fetch(url, api_key))
    # 限制长度，兼容框架
    return content[:4096] if isinstance(content, str) else str(content)

# ===================== 3. 图片搜索（新增：Serper 图片搜索） =====================
async def _serper_image_search(query: str, num_results: int, api_key: str) -> Dict[str, Any]:
    async with httpx.AsyncClient(timeout=5.0) as client:
        response = await client.post(
            "https://google.serper.dev/images",
            headers={"X-API-KEY": api_key, "Content-Type": "application/json"},
            json={"q": query, "num": min(num_results, 50), "gl": "cn", "hl": "zh-cn"}
        )
        response.raise_for_status()
        return response.json()

@tool("image_search", parse_docstring=True)
def image_search_tool(query: str) -> str:
    """Search images using Serper API.

    Args:
        query: Image search query
    """
    api_key, max_results = _get_serper_config()
    if not api_key:
        return "Error: Serper API key 未配置"
    
    res = asyncio.run(_serper_image_search(query, max_results, api_key))
    normalized_results = [
        {
            "title": result.get("title", ""),
            "image_url": result.get("imageUrl", ""),
            "thumbnail_url": result.get("thumbnailUrl", "")
        }
        for result in res.get("images", [])[:max_results]
    ]
    return json.dumps(normalized_results, indent=2, ensure_ascii=False)