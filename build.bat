@echo off
echo 正在构建星核动力科技网站...
echo.

REM 清理之前的构建
if exist public rmdir /s /q public

REM 构建网站
hugo --minify

echo.
echo 构建完成！网站文件位于 public 目录中。
echo.
pause