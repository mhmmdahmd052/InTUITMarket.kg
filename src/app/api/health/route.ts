export async function GET() {
  return Response.json({
    status: 'ok',
    service: 'intuitmarket',
    timestamp: Date.now(),
  })
}