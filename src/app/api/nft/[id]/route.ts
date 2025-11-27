import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const cid = process.env.NEXT_PUBLIC_NFT_CID!
  const url = `https://dweb.link/ipfs/${cid}/${params.id}.png`

  const res = await fetch(url, {
    headers: { 'Cache-Control': 'public, max-age=31536000, immutable' }
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 })
  }

  const buffer = await res.arrayBuffer()

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  })
}
