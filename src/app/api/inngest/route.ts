import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";
import { runScrapingJob } from "@/lib/inngest-functions/scraping";
import { scoreCreators } from "@/lib/inngest-functions/scoring";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [runScrapingJob, scoreCreators],
});
