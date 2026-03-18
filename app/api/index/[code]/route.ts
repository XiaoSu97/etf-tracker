import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { code: string } }
) {
  const { code } = params;
  const searchParams = new URL(request.url).searchParams;
  const market = searchParams.get('market') || 'CN';

  // 使用腾讯财经 API
  return fetchFromTencent(code, market);
}

/**
 * 从腾讯财经 API 获取指数数据
 * API 格式：https://qt.gtimg.cn/q={prefix}{code}
 * - A 股上证：sh{code} 例如 sh000001
 * - A 股深证：sz{code} 例如 sz399975
 * - 港股：hk{code} 例如 hkHSTECH
 * - 美股：us{code} 例如 us.IXIC
 */
async function fetchFromTencent(code: string, market: string) {
  try {
    // 构建腾讯财经 API 的代码前缀
    let tencentCode = '';
    
    if (market === 'CN') {
      // A 股：上证用 sh，深证用 sz
      if (code.startsWith('000') || code.startsWith('600') || code.startsWith('601') || code.startsWith('603')) {
        tencentCode = `sh${code}`;
      } else if (code.startsWith('399') || code.startsWith('002') || code.startsWith('300')) {
        tencentCode = `sz${code}`;
      } else {
        tencentCode = `sh${code}`;
      }
    } else if (market === 'HK') {
      tencentCode = `hk${code}`;
    } else if (market === 'US') {
      // 美股代码映射：腾讯财经使用自定义代码
      const US_CODE_MAP: Record<string, string> = {
        '^DJI': 'us.DJI',
        '^GSPC': 'us.INX',   // 标普500 在腾讯用 INX
        '^IXIC': 'us.IXIC',
      };
      tencentCode = US_CODE_MAP[code] ?? `us.${code.replace('^', '')}`;
    }

    const url = `https://qt.gtimg.cn/q=${tencentCode}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    // 腾讯财经返回 GBK 编码，需要解码
    const buffer = await response.arrayBuffer();
    const text = new TextDecoder('gbk').decode(buffer);

    // 解析腾讯财经数据格式：v_{code}="字段0~字段1~..."
    const match = text.match(/v_[^=]+="([^"]+)"/);
    if (!match) {
      return NextResponse.json({
        error: 'No data available',
        code,
        market
      }, { status: 404 });
    }

    const fields = match[1].split('~');
    
    // 腾讯财经字段索引：
    // 0: 市场类型
    // 1: 名称
    // 2: 代码
    // 3: 当前价格
    // 4: 昨收
    // 5: 今开
    // 6: 成交量
    // 31: 涨跌额
    // 32: 涨跌幅(%)
    // 33: 最高
    // 34: 最低
    // 38: PB
    // 39: PE
    
    const name = fields[1] || 'Unknown';
    const price = parseFloat(fields[3]) || 0;
    const prevClose = parseFloat(fields[4]) || price;
    const open = parseFloat(fields[5]) || 0;
    const volume = parseFloat(fields[6]) || 0;
    const change = parseFloat(fields[31]) || (price - prevClose);
    const changePercent = parseFloat(fields[32]) || (prevClose !== 0 ? (price - prevClose) / prevClose * 100 : 0);
    const high = parseFloat(fields[33]) || price;
    const low = parseFloat(fields[34]) || price;
    const pb = parseFloat(fields[38]) || 0;
    const pe = parseFloat(fields[39]) || 0;

    return NextResponse.json({
      code,
      name,
      price,
      change,
      changePercent,
      high,
      low,
      open,
      prevClose,
      volume,
      pe,
      pb,
      updatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Tencent API Error:', error);
    return NextResponse.json({
      error: 'Failed to fetch data',
      message: error instanceof Error ? error.message : 'Unknown error',
      code,
      market
    }, { status: 500 });
  }
}
