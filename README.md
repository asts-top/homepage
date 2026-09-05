# Hi, PW · 我的数字小院

个人主页与服务导航，部署于 <https://www.hipw.cc/>。使用原生 HTML、CSS 和 JavaScript，无运行时依赖，也不需要构建。

## 本地预览

在仓库目录执行：

```sh
python -m http.server 4173 --bind 127.0.0.1
```

打开 <http://127.0.0.1:4173>。也可以直接打开 `index.html`，但浏览器对本地文件的收藏与历史存储支持可能不同。

## 内容与设计

- `index.html`：导航入口、分类、搜索关键词、介绍和原创 SVG 插画。
- `styles.css`：奶油白／墨绿两套主题、桌面与移动布局、减少动态效果偏好。
- `app.js`：搜索、分类、收藏、最近访问、本地时钟和主题设置。
- `assets/favicon.svg`：本地图标。
- `CNAME`：原有 GitHub Pages 域名配置。

所有服务链接直接写在 HTML 中，关闭 JavaScript 也能正常导航。新增入口时，在 `#service-grid` 中复制一个 `.service-card`，更新唯一 `data-id`、分类 `data-category`、搜索别名 `data-keywords`、链接、图标、名称与说明即可。分类使用 `daily`（日常）、`ai`（AI 工具）或 `manage`（服务管理）。同步调整首页的入口总数。

收藏和历史从卡片读取完整链接，保留 CPA 的 `/management.html#/login`、Kiro 的 `/admin` 等地址。所有现有主机均支持 HTTPS，入口统一使用 HTTPS。服务的可用性由各服务自身决定；主页不显示未经探测的在线状态。

## 使用方式

- 输入名称、中文用途、域名或多个关键词搜索。
- 点击分类或「收藏」筛选；点亮星标收藏工具。
- `/` 或 `Ctrl/Cmd + K` 聚焦搜索；`Esc` 在搜索框中清空搜索。
- 最近打开显示最近 4 个不同入口，可单独清空。所有入口在新标签页打开。
- 主题默认跟随系统，手动选择后记住偏好。

## 存储与性能

收藏、历史和主题只保存在当前浏览器的 `localStorage`（`pw.favorites.v1`、`pw.recent.v1`、`pw.theme`）。旧版本 `recentVisits` 中的已知服务会迁移到完整的导航地址。损坏或不可用的存储不会阻断导航；无法持久保存时降级为本次会话记录。多个标签页的更改会同步。

页面不加载第三方字体、图标库或分析脚本，不请求服务健康状态。SVG 仅在进入页面时播放一次轻微动画，尊重 `prefers-reduced-motion`；时钟每分钟更新一次，在后台标签页暂停。

## 发布

保持 GitHub Pages 当前的分支发布设置和 `CNAME`。将经过预览确认的分支合并到 `main` 后，GitHub Pages 按仓库配置发布。
