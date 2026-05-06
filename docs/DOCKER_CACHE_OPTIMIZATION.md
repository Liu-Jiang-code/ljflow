# Docker 构建缓存优化方案

## 背景

目前 Docker 构建时，`backend` 的 Python 依赖（uv 虚拟环境）和 `frontend` 的 Node.js 依赖（`node_modules`）都是在构建过程中在线安装的。每次构建都需要重新下载，耗时较长。

## 依赖位置

| 模块 | 依赖管理工具 | 虚拟环境/依赖目录 | 构建产物位置 |
|------|------------|------------------|------------|
| backend | uv (pyproject.toml) | `backend/.venv/` | `/app/backend/.venv/` |
| frontend | pnpm (package.json) | `frontend/node_modules/` | `/app/frontend/node_modules/` |

- **Backend**: 基于 `python:3.12-slim-bookworm`，使用 `uv sync` 安装依赖到 `backend/.venv/`
- **Frontend**: 基于 `node:22-alpine`，使用 `pnpm install --frozen-lockfile` 安装依赖到 `frontend/node_modules/`

## 优化方案：预压缩 + 惰性解压

### 思路

在 Docker 构建时，将安装好的依赖目录先压缩成归档文件存放到镜像中；容器启动时，检查目标虚拟环境目录是否为空，若为空则解压，否则跳过。

### 优点

1. 构建产物镜像更小（单个归档文件 vs 数万个小文件，减少 inode 和 layer 数量）
2. 容器启动速度更快（解压一个归档文件比 `pip install` / `pnpm install` 快得多）
3. 适合离线/受限网络环境

### Backend 实现示例

在 `backend/Dockerfile` 的 builder 阶段末尾添加压缩步骤：

```dockerfile
# 在 uv sync 之后，将 .venv 压缩成单个归档
RUN cd /app/backend && \
    tar -czf /tmp/backend-venv.tar.gz .venv && \
    rm -rf .venv
```

在 runtime 阶段，修改 CMD 为启动脚本：

```dockerfile
COPY --from=builder /tmp/backend-venv.tar.gz /tmp/backend-venv.tar.gz
```

容器入口脚本（例如 `entrypoint.sh`）：

```bash
#!/bin/bash
# 如果 .venv 目录不存在或为空，则从归档解压
if [ ! -d /app/backend/.venv ] || [ -z "$(ls -A /app/backend/.venv 2>/dev/null)" ]; then
    echo "解压 backend 虚拟环境..."
    tar -xzf /tmp/backend-venv.tar.gz -C /app/backend/
fi
# 启动服务
cd /app/backend && PYTHONPATH=. uv run uvicorn app.gateway.app:app --host 0.0.0.0 --port 8001
```

### Frontend 实现示例

在 `frontend/Dockerfile` 的 builder 阶段末尾添加压缩：

```dockerfile
RUN cd /app/frontend && \
    tar -czf /tmp/frontend-node_modules.tar.gz node_modules && \
    rm -rf node_modules
```

在 prod 阶段将其复制过来：

```dockerfile
COPY --from=builder /tmp/frontend-node_modules.tar.gz /tmp/frontend-node_modules.tar.gz
```

容器启动脚本：

```bash
#!/bin/bash
if [ ! -d /app/frontend/node_modules ] || [ -z "$(ls -A /app/frontend/node_modules 2>/dev/null)" ]; then
    echo "解压 frontend node_modules..."
    tar -xzf /tmp/frontend-node_modules.tar.gz -C /app/frontend/
fi
cd /app/frontend && pnpm start
```

### 注意事项

1. **归档格式**：使用 `tar.gz` 而非 `zip`，因为 `tar` 能更好地保留文件权限、符号链接和可执行属性
2. **缓存挂载**：Docker 的 `--mount=type=cache` 仍然可以保留，作为首次构建的加速手段
3. **分层构建**：建议将归档文件放在单独的镜像层，这样只有当依赖发生变化时才会更新该层
4. **兼容性**：该方案不影响本地开发流程，因为本地开发时 `.venv` 和 `node_modules` 是持久化的
