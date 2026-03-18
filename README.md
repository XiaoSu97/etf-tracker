# ETF Tracker - 指数估值跟踪工具

一个基于 Next.js 的指数估值跟踪网页，支持 A 股、港股、美股的实时估值分析和 PE 百分位计算。

## ✨ 功能特性

- 📊 **实时估值** - 支持 A 股/港股/美股指数实时行情
- 📈 **PE 百分位** - 基于历史数据自动计算估值百分位
- 🎯 **悬浮显示** - 鼠标悬停查看详细数据
- 💾 **本地存储** - 自选列表持久化到 localStorage
- 📱 **响应式** - 支持桌面端和移动端
- 🌓 **暗色模式** - 支持明暗主题切换

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 本地开发

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
npm start
```

## 📦 部署到 Vercel

### 方式一：一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/etf-tracker)

### 方式二：手动部署

1. **推送到 GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/你的用户名/etf-tracker.git
   git push -u origin main
   ```

2. **在 Vercel 部署**
   - 访问 https://vercel.com
   - 点击 "New Project"
   - 导入你的 GitHub 仓库
   - 点击 "Deploy"

3. **完成！**
   - 获得网址：`https://etf-tracker-你的用户名.vercel.app`

## 📊 支持的市场

| 市场 | 示例代码 | 数据源 |
|------|----------|--------|
| A 股 | 399975, 000001 | 东方财富 |
| 港股 | HSTECH, HSI | 东方财富 |
| 美股 | ^IXIC, ^GSPC, ^DJI | 雅虎财经 |

## 🛠️ 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **图表**: ECharts
- **存储**: localStorage
- **部署**: Vercel

## 📁 项目结构

```
etf-tracker/
├── app/                    # Next.js 页面
│   ├── page.tsx           # 首页 - 自选列表
│   ├── add/page.tsx       # 添加自选页
│   └── index/[code]/page.tsx  # 指数详情页
├── components/            # React 组件
│   ├── Header.tsx        # 导航栏
│   ├── WatchlistCard.tsx # 自选卡片
│   ├── PEPercentile.tsx  # PE 百分位组件
│   ├── ValuationChart.tsx # 估值图表
│   ├── Tooltip.tsx       # 悬浮提示
│   └── AddSymbolModal.tsx # 添加弹窗
├── lib/                   # 工具库
│   ├── api.ts            # API 封装
│   ├── storage.ts        # localStorage 封装
│   └── pe-calculator.ts  # PE 计算
├── types/                 # TypeScript 类型
└── data/historical-pe/   # 历史 PE 数据
```

## 📝 添加更多指数数据

在 `data/historical-pe/` 目录下添加 JSON 文件：

```json
{
  "code": "指数代码",
  "name": "指数名称",
  "market": "CN|HK|US",
  "data": [
    {"date": "2024-01-15", "pe": 22.96, "pb": 1.45, "price": 785.42}
  ]
}
```

## ⚠️ 注意事项

- 数据来源于免费 API，仅供参考
- 不构成投资建议
- 历史 PE 数据需要手动维护更新

## 📄 License

MIT

---

**开发时间**: 2026-03-18
**作者**: Cooper Su
