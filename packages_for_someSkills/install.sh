
/opt/backend-venv/bin/pip install \
    -t /app/packages_for_someSkills/packages \
    --no-cache-dir \
    beautifulsoup4>=4.12.3 \
    lxml>=5.3.0 \
    python-dateutil>=2.9.0 \
    PyYAML>=6.0.2 \
    requests>=2.32.3 \
    trafilatura>=1.12.2 \
    duckduckgo-search>=6.3.0 \
    pypdf>=5.0.1 \
    python-docx \
    tenacity>=8.2.0 \
    aiohttp>=3.9.0


/opt/backend-venv/bin/pip install \
    -t /app/packages_for_someSkills/packages \
    --no-cache-dir \
    --index-url https://mirrors.tuna.tsinghua.edu.cn/pytorch-whl/cu118 \
    torch \
    transformers>=4.35.0 \
    FlagEmbedding>=1.2.0

/opt/backend-venv/bin/python -c "
import sys
sys.path.insert(0, '/app/packages_for_someSkills/packages')
# 基础包
import bs4, lxml, dateutil, yaml, requests, trafilatura, duckduckgo_search, pypdf, docx, tenacity, aiohttp
# 重型包
import torch
import transformers
import FlagEmbedding
print('✅ 所有 14 个依赖包安装成功！')
print(f'PyTorch version: {torch.__version__}')
print(f'CUDA available: {torch.cuda.is_available()}')
if torch.cuda.is_available():
    print(f'CUDA device: {torch.cuda.get_device_name(0)}')
"


