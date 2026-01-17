## Nginx 反向代理说明

这是一个 Docker Nginx 反向代理容器，用于统一管理多个前端项目的域名映射。

### 架构

```
Internet (80/443)
    ↓
Nginx 反向代理 (本容器)
    ↓
├─→ bhub-web:8888 (bhub.bojuxi.com)
├─→ admin-web:8889 (admin.bojuxi.com) - 未来项目
└─→ api-web:8890 (api.bojuxi.com) - 未来项目
```

### 功能

- 监听 80/443 端口，接收所有域名请求
- 根据域名自动路由到对应的后端容器
- 统一管理 SSL 证书（未来可配置）
- 支持多项目扩展

### 文件说明

- `docker-compose.yml` - Docker Compose 配置
- `nginx.conf` - Nginx 主配置文件
- `conf.d/bhub.conf` - BHub 项目域名配置
- `conf.d/*.conf` - 其他项目配置（按需添加）

### 使用方法

启动反向代理：
```bash
cd docker/nginx
docker-compose up -d
```

查看日志：
```bash
docker logs -f nginx-proxy
```

停止服务：
```bash
docker-compose down
```

### 添加新项目

在 `conf.d/` 目录下创建新的配置文件，例如 `admin.conf`：

```nginx
server {
    listen 80;
    server_name admin.bojuxi.com;

    location / {
        proxy_pass http://admin-web:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

重启 Nginx：
```bash
docker-compose restart
```

### 注意事项

- 所有后端项目容器必须在同一个 Docker 网络 `app-network` 中
- 本地测试需要在 hosts 文件添加域名映射：`127.0.0.1 bhub.bojuxi.com`
- 生产环境需要在域名提供商配置 DNS 解析
