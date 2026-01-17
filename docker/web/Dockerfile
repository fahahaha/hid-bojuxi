# 生产环境 Dockerfile（使用已构建的 dist-web）
FROM nginx:alpine

# 复制自定义 nginx 配置（相对于项目根目录）
COPY docker/web/nginx.conf /etc/nginx/conf.d/default.conf

# 复制已构建好的文件（相对于项目根目录）
COPY dist-web /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
