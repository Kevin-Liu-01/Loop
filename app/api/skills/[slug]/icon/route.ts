import { requireAuth, authErrorResponse } from "@/lib/auth";
import { getAuthorizedAdminEmail } from "@/lib/admin";
import { uploadIcon, validateIconFile, updateSkillIconUrl } from "@/lib/icon-storage";
import { getSkillRecordBySlug } from "@/lib/content";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await requireAuth();
    const { slug } = await params;

    const skill = await getSkillRecordBySlug(slug);
    if (!skill) {
      return Response.json({ error: "Skill not found." }, { status: 404 });
    }

    const isAdmin = getAuthorizedAdminEmail(request) !== null;
    const isCreator = skill.creatorClerkUserId === session.userId;
    if (!isAdmin && !isCreator) {
      return Response.json(
        { error: "Only the skill creator or an admin can change the icon." },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("icon") as File | null;
    if (!file) {
      return Response.json({ error: "Missing 'icon' file field." }, { status: 400 });
    }

    const validationError = validateIconFile(file);
    if (validationError) {
      return Response.json({ error: validationError }, { status: 400 });
    }

    const { publicUrl } = await uploadIcon("skills", slug, file);
    await updateSkillIconUrl(slug, publicUrl);

    return Response.json({ ok: true, iconUrl: publicUrl });
  } catch (error) {
    const authResp = authErrorResponse(error);
    if (authResp) return authResp;
    console.error("[skill-icon] Upload failed:", error);
    return Response.json(
      { error: "Icon upload failed." },
      { status: 500 }
    );
  }
}
