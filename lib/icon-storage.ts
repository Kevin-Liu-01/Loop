import { getServerSupabase } from "@/lib/db/client";

const BUCKET_NAME = "skill-icons";
const MAX_FILE_SIZE = 1_048_576; // 1 MB
const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/svg+xml",
  "image/webp",
  "image/jpeg",
]);
const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/svg+xml": "svg",
  "image/webp": "webp",
};

export interface IconUploadResult {
  publicUrl: string;
  storagePath: string;
}

export function validateIconFile(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return `Invalid file type: ${file.type}. Allowed: PNG, SVG, WebP, JPEG.`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `File too large: ${(file.size / 1024).toFixed(0)} KB. Maximum: 1 MB.`;
  }
  return null;
}

export async function uploadIcon(
  folder: "skills" | "mcps",
  identifier: string,
  file: File
): Promise<IconUploadResult> {
  const db = getServerSupabase();
  const ext = MIME_TO_EXT[file.type] ?? "png";
  const storagePath = `${folder}/${identifier}/${Date.now()}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await db.storage
    .from(BUCKET_NAME)
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (error) {
    throw new Error(`Icon upload failed: ${error.message}`);
  }

  const { data: urlData } = db.storage
    .from(BUCKET_NAME)
    .getPublicUrl(storagePath);

  return { publicUrl: urlData.publicUrl, storagePath };
}

export async function updateSkillIconUrl(
  slug: string,
  iconUrl: string
): Promise<void> {
  const db = getServerSupabase();
  const { error } = await db
    .from("skills")
    .update({ icon_url: iconUrl } as never)
    .eq("slug", slug);

  if (error) {
    throw new Error(`updateSkillIconUrl failed: ${error.message}`);
  }
}

export async function updateMcpIconUrl(
  mcpName: string,
  iconUrl: string
): Promise<void> {
  const db = getServerSupabase();
  const { error } = await db
    .from("imported_mcps")
    .update({ icon_url: iconUrl } as never)
    .eq("name", mcpName);

  if (error) {
    throw new Error(`updateMcpIconUrl failed: ${error.message}`);
  }
}
