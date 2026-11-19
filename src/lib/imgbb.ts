/**
 * Uploads an image file to ImgBB through its public REST API.
 * Sends the binary as multipart form-data and returns the hosted display URL.
 */
export async function uploadToImgBB(file: File): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ImgBB API key is missing. Please set NEXT_PUBLIC_IMGBB_API_KEY in your .env file, or proceed without an image."
    );
  }

  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: "POST",
    body: formData,
  });

  const data = (await res.json()) as {
    success?: boolean;
    data?: { display_url?: string; url?: string };
    error?: { message?: string };
  };

  if (!res.ok || !data.success || !data.data) {
    throw new Error(data?.error?.message || "Failed to upload image to ImgBB.");
  }

  return data.data.display_url || data.data.url || "";
}
