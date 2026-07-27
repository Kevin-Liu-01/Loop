import { invalidatePublicCatalogue } from "@/lib/cache-invalidation";
import { sendWeeklyDigest } from "@/lib/email/weekly-digest";
import { hasValidBearerToken } from "@/lib/request-auth";
import { withApiUsage } from "@/lib/usage-server";
import { runWeeklyImport } from "@/lib/weekly-import";

export const maxDuration = 300;

export async function GET(request: Request) {
  return withApiUsage(
    {
      label: "Weekly import + refresh cron",
      method: "GET",
      route: "/api/cron/weekly-import",
    },
    async () => {
      if (
        !hasValidBearerToken(
          request.headers.get("authorization"),
          process.env.CRON_SECRET
        )
      ) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }

      const result = await runWeeklyImport();

      if (result && result.imported.length > 0) {
        try {
          invalidatePublicCatalogue();
        } catch (revalidateError) {
          console.error(
            "[weekly-cron] Cache revalidation failed:",
            revalidateError
          );
        }

        try {
          await sendWeeklyDigest(result);
        } catch (emailError) {
          console.error("[weekly-cron] Email digest failed:", emailError);
        }
      }

      return Response.json({
        details: result,
        errors: result?.errors.length ?? 0,
        imported: result?.imported.length ?? 0,
        ok: true,
        skipped: result?.skipped.length ?? 0,
      });
    }
  );
}
