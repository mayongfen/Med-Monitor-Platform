/** @type {import('next').NextConfig} */
const nextConfig = {
  // 静态导出，产物输出到 out/ 目录，用于部署到 GitHub Pages
  output: 'export',
  // 项目站点地址为 https://mayongfen.github.io/Med-Monitor-Platform/
  // basePath 让所有路由和静态资源前缀都带上 /Med-Monitor-Platform，否则资源 404
  basePath: '/Med-Monitor-Platform',
  // GitHub Pages 适合目录式 URL（/dashboard/ → /dashboard/index.html）
  trailingSlash: true,
  // GitHub Pages 无服务端，图片必须关闭优化走原图
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
