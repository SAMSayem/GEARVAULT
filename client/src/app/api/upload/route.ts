import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ message: "Sign in to upload an image" }, { status: 401 });
  }
  const role = (session.user as typeof session.user & { role?: string }).role;
  if (role !== "owner" && role !== "admin") {
    return NextResponse.json({ message: "Only equipment owners can upload listing images" }, { status: 403 });
  }

  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ message: "Image upload is not configured" }, { status: 503 });
  }

  try {
    const incoming = await request.formData();
    const image = incoming.get("image");
    if (!(image instanceof File)) {
      return NextResponse.json({ message: "An image file is required" }, { status: 400 });
    }
    if (!image.type.startsWith("image/")) {
      return NextResponse.json({ message: "Only image files are allowed" }, { status: 400 });
    }
    if (image.size > 8 * 1024 * 1024) {
      return NextResponse.json({ message: "Image must be 8 MB or smaller" }, { status: 413 });
    }

    const body = new FormData();
    body.append("image", image);
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      body,
      cache: "no-store",
    });
    const result = await response.json();
    if (!response.ok || !result.success || !result.data?.url) {
      return NextResponse.json({ message: "ImgBB could not upload this image" }, { status: 502 });
    }
    return NextResponse.json({ url: result.data.url });
  } catch {
    return NextResponse.json({ message: "Image upload failed" }, { status: 500 });
  }
}
