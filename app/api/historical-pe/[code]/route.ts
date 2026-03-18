import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(
  _request: Request,
  { params }: { params: { code: string } }
) {
  const { code } = params;

  // 只允许合法字符，防止路径穿越
  if (!/^[\w\-^.]+$/.test(code)) {
    return NextResponse.json({ data: [] });
  }

  try {
    const filePath = path.join(process.cwd(), 'data', 'historical-pe', `${code}.json`);
    const raw = await readFile(filePath, 'utf-8');
    const json = JSON.parse(raw);
    return NextResponse.json({ data: json.data ?? [] });
  } catch {
    return NextResponse.json({ data: [] });
  }
}
