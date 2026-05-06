# Docker 构建方案

本项目使用自定义 Docker 构建策略，而非 Docker 默认的镜像构建方式。

## 核心策略

### 1. 压缩局部虚拟环境

构建镜像时，将 Python 虚拟环境（`backend/.venv`）和前端依赖（`frontend/node_modules`）分别压缩为 `tar.gz` 归档文件后放入镜像，而非直接复制散落的小文件。

容器启动时，检查目标目录是否为空，若为空则从归档解压，否则跳过。

**优点**：
- 减少镜像 layer 数量和 inode 开销
- 加速容器启动（解压归档比在线安装快得多）
- 适合离线或受限网络环境

详见 [DOCKER_CACHE_OPTIMIZATION.md](../docs/DOCKER_CACHE_OPTIMIZATION.md)。

### 2. 项目代码直接挂载到容器

开发模式下，项目源代码通过 Docker volume 直接挂载到容器内，而非在构建时拷贝进去。这确保了：

- 宿主机上的代码修改即时生效（热更新）
- 无需每次修改代码都重新构建镜像
- 构建镜像与运行时代码解耦

### 3. 扩展 Python 扫描路径（PYTHONPATH）

本地包（未发布到 PyPI 的模块）通过 `PYTHONPATH` 环境变量加入 Python 的模块搜索路径，无需安装到虚拟环境中。

常见的挂载目录包括：

| 目录 | 内容 |
|------|------|
| `backend/packages/harness` | DeerFlow 沙箱执行框架核心包 |
| `packages_for_someSkills` | 部分 Skill 的第三方依赖包 |

在 `docker-compose.yaml` 中通过 `PYTHONPATH` 环境变量注入：

```yaml
environment:
  - PYTHONPATH=/app/backend/packages/harness:/app/packages_for_someSkills
```

这使得这些目录下的 Python 包可以直接被 `import`，无需 `pip install -e`。

## 与传统方案对比

| 方面 | 传统 Docker 方案 | 本方案 |
|------|----------------|--------|
| 依赖部署 | 在线安装（慢、依赖网络） | 预压缩归档（快、可离线） |
| 代码同步 | COPY 到镜像（改代码需重构建） | Volume 挂载（改代码即时生效） |
| 本地包 | 需 `pip install -e` 安装 | PYTHONPATH 直接扫描 |
