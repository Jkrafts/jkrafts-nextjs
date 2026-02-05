import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const laravelRes = await fetch(
      `${process.env.LARAVEL_API_URL}/contact`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    const data = await laravelRes.json();

    if (!laravelRes.ok) {
      return NextResponse.json(
        { error: data },
        { status: laravelRes.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: `Internal server error ${error}` },
      { status: 500 }
    );
  }
}
