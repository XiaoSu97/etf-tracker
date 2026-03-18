/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'up': '#ef4444',    // 涨 - 红色
        'down': '#22c55e',  // 跌 - 绿色
        'low': '#22c55e',   // 低估 - 绿色
        'mid': '#6b7280',   // 中性 - 灰色
        'high': '#ef4444',  // 高估 - 红色
        'dark': {
          bg: '#0f172a',
          card: '#1e293b',
          border: '#334155',
        }
      },
    },
  },
  plugins: [],
}
