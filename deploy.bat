@echo off
echo ========================================
echo 星核动力科技官网部署脚本
echo ========================================
echo.

echo [1/3] 清理旧的构建文件...
if exist public rmdir /s /q public
echo 完成！

echo.
echo [2/3] 构建生产版本...
hugo --minify
if %errorlevel% neq 0 (
    echo 构建失败！请检查错误信息。
    pause
    exit /b 1
)
echo 完成！

echo.
echo [3/3] 构建完成！
echo 生产文件已生成到 public 目录
echo.
echo 部署选项：
echo 1. 上传 public 目录到您的服务器
echo 2. 使用 FTP/SFTP 工具上传文件
echo 3. 配置 CDN 和域名解析
echo.
echo 推荐部署平台：
echo - Netlify: 拖拽 public 目录即可部署
echo - Vercel: 连接 Git 仓库自动部署
echo - GitHub Pages: 推送到 gh-pages 分支
echo.
echo 部署完成后，请测试以下功能：
echo - 页面加载速度
echo - 移动端适配
echo - 表单提交功能
echo - 搜索功能
echo.
pause