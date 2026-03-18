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
    if (code === '000001' || code === '000300') {
      secid = `1.${code}`;  // 上证指数
    } else if (code === '399975' || code === '399999') {
      secid = `0.${code}`;  // 深证指数
    } else {
      secid = `1.${code}`;
    }
  } else if (market === 'HK') {
    secid = `100.${code}`;
  }

  const fields = 'f43,f44,f45,f46,f47,f48,f49,f50,f51,f52,f53,f54,f55,f56,f57,f128,f129,f130,f131,f132,f133,f134,f135,f136,f137,f138,f139,f140,f141,f142,f143,f144,f145,f146,f147,f148,f149,f150,f151,f152,f153,f154,f155,f156,f157,f158,f159,f160,f161,f162,f163,f164,f165,f166,f167,f168,f169,f170,f171,f172,f173,f174,f175,f176,f177,f178,f179,f180,f181,f182,f183,f184,f185,f186,f187,f188,f189,f190,f191,f192,f193,f194,f195,f196,f197,f198,f199,f200,f58';
  
  const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${secid}&fields=${fields}&ndec=1&mlvl=2`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Origin': 'https://quote.eastmoney.com',
        'Referer': 'https://quote.eastmoney.com/',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.data) {
      return NextResponse.json({ 
        error: 'No data available',
        code,
        market 
      }, { status: 404 });
    }

    const stockData = data.data;

    return NextResponse.json({
      code,
      name: stockData.f58 || 'Unknown',
      price: stockData.f43 || 0,
      change: stockData.f44 || 0,
      changePercent: stockData.f45 || 0,
      pe: stockData.f128 || 0,
      pb: stockData.f129 || 0,
      high: stockData.f46 || 0,
      low: stockData.f47 || 0,
      open: stockData.f48 || 0,
      prevClose: stockData.f60 || 0,
      volume: stockData.f49 || 0,
      turnover: stockData.f50 || 0,
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
