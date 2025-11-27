import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  context: { params: Record<string, string> }
) {
  const id = context.params.id
  const cid = process.env.NEXT_PUBLIC_NFT_CID!

  const url = `https://dweb.link/ipfs/${cid}/${id}.png`

  const res = await fetch(url)

  if (!res.ok) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const buffer = await res.arrayBuffer()

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  })
}
