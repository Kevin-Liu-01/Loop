import { revalidatePath } from "next/cache";

import { getAuthorizedAdminEmail } from "@/lib/admin";
import { withApiUsage } from "@/lib/usage-server";
import { runWeeklyImport } from "@/lib/weekly-import";

export async function POST(request: Request) {
  return withApiUsage(
    {
      label: "Admin manual import",
      method: "POST",
      route: "/api/admin/imports",
    },
    async () => {
      const admin = getAuthorizedAdminEmail(request);
      if (!admin) {
        return Response.json(
          { error: "Admin access required." },
          { status: 403 }
        );
      }

      const result = await runWeeklyImport();

      revalidatePath("/", "layout");
      revalidatePath("/settings/imports", "layout");

      return Response.json({
        details: result,
        errors: result.errors.length,
        imported: result.imported.length,
        ok: true,
        skipped: result.skipped.length,
      });
    }
  );
}
