import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { code: string } }
) {
  const { code } = params;
  const searchParams = new URL(request.url).searchParams;
  const market = searchParams.get('market') || 'CN';

  // 构建东方财富 API secid
  let secid = '';
  if (market === 'CN') {
    // A 股指数：上证指数 1.000001，深证指数 0.399001
    if (code.startsWith('000') || code.startsWith('600') || code.startsWith('601')) {
      secid = `1.${code}`;  // 上证指数/沪市
    } else if (code.startsWith('399') || code.startsWith('002')) {
      secid = `0.${code}`;  // 深证指数/深市
    } else {
      secid = `1.${code}`;
    }
  } else if (market === 'HK') {
    secid = `100.${code}`;
  } else if (market === 'US') {
    // 美股使用 Yahoo Finance
    return fetchFromYahoo(code);
  }

  const fields = 'f43,f44,f45,f46,f47,f48,f49,f50,f51,f52,f53,f54,f55,f56,f57,f58,f128,f129';
  
  const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${secid}&fields=${fields}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Referer': 'https://quote.eastmoney.com/',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const json = await response.json();

    if (!json.data) {
      return NextResponse.json({ 
        error: 'No data available',
        code,
        market 
      }, { status: 404 });
    }

    const d = json.data;

    return NextResponse.json({
      code,
      name: d.f58 || 'Unknown',
      price: d.f43 || 0,
      change: d.f44 || 0,
      changePercent: d.f45 || 0,
      high: d.f46 || 0,
      low: d.f47 || 0,
      open: d.f48 || 0,
      prevClose: d.f60 || d.f43 || 0,
      volume: d.f49 || 0,
      turnover: d.f50 || 0,
      pe: d.f128 || 0,
      pb: d.f129 || 0,
      updatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch data',
      message: error instanceof Error ? error.message : 'Unknown error',
      code,
      market 
    }, { status: 500 });
  }
}

// 雅虎财经 API（用于美股）
async function fetchFromYahoo(code: string) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${code}?interval=1d&range=1d`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const json = await response.json();
    
    if (!json.chart?.result?.[0]) {
      return NextResponse.json({ error: 'No data' }, { status: 404 });
    }

    const result = json.chart.result[0];
    const meta = result.meta;
    const quote = result.indicators?.quote?.[0] || {};

    const price = quote.close?.[0] || meta.regularMarketPrice || 0;
    const prevClose = meta.previousClose || price;
    const change = price - prevClose;
    const changePercent = prevClose ? (change / prevClose) * 100 : 0;

    return NextResponse.json({
      code,
      name: meta.symbol || code,
      price,
      change,
      changePercent,
      pe: 0,
      pb: 0,
      updatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Yahoo API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch US market data',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
