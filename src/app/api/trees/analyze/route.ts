import { NextRequest, NextResponse } from "next/server";
import { weatherApi } from "@/lib/weather-api";
import { apiError } from "@/lib/api-error";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const image = formData.get("image");

    if (!image || !(image instanceof File)) {
      return NextResponse.json({ error: "image file is required" }, { status: 400 });
    }

    const data = await weatherApi.analyzeTrees(formData);
    return NextResponse.json(data);
  } catch (err) {
    return apiError(err, "Tree analysis failed");
  }
}
