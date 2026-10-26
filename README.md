# 墨记 · ink-notes

一个**纯本地**的 Markdown 笔记本：打开即写，数据只存在浏览器 `localStorage` 里，不联网、不上传、不需要登录。

![界面预览](https://img.shields.io/badge/React-18-61dafb) ![Vite](https://img.shields.io/badge/Vite-5-646cff) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)

## 功能

- **双栏实时预览**：左边写 Markdown，右边即时渲染，可切换编辑 / 分栏 / 纯预览
- **多笔记管理**：新建、切换、搜索（标题 + 正文）、删除，按更新时间排序
- **自动保存**：防抖写入 `localStorage`，刷新或关掉页面都不会丢
- **格式工具栏**：加粗、斜体、标题、引用、列表、代码块、链接、待办、表格
- **可点击的复选框**：在预览里直接勾选 `- [ ]`，源码同步更新
- **导入 / 导出**：支持批量导入 `.md` / `.txt`，一键导出当前笔记
- **明暗主题**：跟随系统，也可手动切换，选择会记住
- **响应式**：桌面双栏、移动端抽屉式侧栏，纯键盘可用

## 本地运行

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 类型检查 + 生产构建，产物在 dist/
npm run preview  # 预览构建结果
```

## 部署到 GitHub Pages

仓库已内置 `.github/workflows/deploy.yml`：推送到 `main` 后自动构建并发布。

首次使用时，在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**，之后的每次推送都会自动更新站点。

`vite.config.ts` 中 `base: './'` 使用相对路径，因此部署在 `/<仓库名>/` 子路径下也能正常加载资源。

## 快捷键

| 操作 | 快捷键 |
| --- | --- |
| 新建笔记 | `⌘ / Ctrl + N` |
| 加粗 | `⌘ / Ctrl + B` |
| 斜体 | `⌘ / Ctrl + I` |
| 缩进 | `Tab` |

## 技术说明

- `marked` 负责 Markdown 解析，`DOMPurify` 过滤渲染结果，避免 XSS
- 预览中的复选框与外链在渲染后统一处理（去掉 `disabled`、外链 `target="_blank"`）
- 数据仅有一份：浏览器本地存储。清理站点数据会同时清空笔记，重要内容请及时导出

## 目录结构

```
src/
├── components/     Sidebar / Editor / Preview / Icon
├── lib/            markdown 渲染、笔记工具函数、欢迎文案
├── App.tsx         状态与本地存储
└── index.css       主题变量与全部样式
```
