import { MongoClient, MongoServerSelectionError } from "mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();
  const client = new MongoClient(process.env.MONGODB_URI as string, {
    serverSelectionTimeoutMS: 8000,
  });

  try {
    await client.db("admin").command({ ping: 1 });
    return Response.json({
      ok: true,
      ms: Date.now() - started,
      region: process.env.VERCEL_REGION,
    });
  } catch (err: unknown) {
    const servers =
      err instanceof MongoServerSelectionError && err.reason
        ? Array.from(err.reason.servers.entries()).map(([host, server]) => ({
            host,
            error: server.error?.message ?? null,
          }))
        : [];

    return Response.json(
      {
        ok: false,
        ms: Date.now() - started,
        region: process.env.VERCEL_REGION,
        name: err instanceof Error ? err.name : "UnknownError",
        message: err instanceof Error ? err.message : String(err),
        servers,
      },
      { status: 500 },
    );
  } finally {
    await client.close();
  }
}
