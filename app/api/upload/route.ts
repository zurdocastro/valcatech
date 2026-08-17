import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getAdminSession } from "@/lib/auth";
import { canWrite } from "@/lib/permissions";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const ALLOWED_FOLDERS = ["email-campaigns", "products"];

// Uploads go client -> Vercel Blob directly (this route only issues a short-lived
// token and gets notified when done) instead of client -> this route -> Blob,
// because Vercel's serverless functions hard-cap request bodies at ~4.5MB —
// well under what these marketing images actually are — and that cap rejects
// the request before it ever reaches our code, so route through the browser
// upload SDK instead. See https://vercel.com/docs/vercel-blob/using-blob-sdk#client-uploads
export async function POST(req: Request) {
  const body = (await req.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        const session = await getAdminSession();
        if (!session || !canWrite(session.role)) throw new Error("Forbidden");

        const folder = pathname.split("/")[0];
        if (!ALLOWED_FOLDERS.includes(folder)) throw new Error("Invalid folder");

        return {
          allowedContentTypes: ALLOWED_TYPES,
          maximumSizeInBytes: MAX_SIZE,
          addRandomSuffix: true,
        };
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: 400 });
  }
}
