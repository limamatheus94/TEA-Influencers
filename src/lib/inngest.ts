import { Inngest } from "inngest";

export const inngest = new Inngest({ id: "curator-marketplace" });

export type ScrapingJobEvent = {
  name: "scraping/job.created";
  data: {
    scrapingJobId: string;
    source: "SPOTIFY" | "YOUTUBE" | "MANUAL";
    query: string;
    genre: string;
    outreachCampaignId: string;
  };
};

export type ScoreCreatorsEvent = {
  name: "outreach/creators.score";
  data: {
    outreachCampaignId: string;
    contactIds: string[];
  };
};

export type SendEmailEvent = {
  name: "outreach/email.send";
  data: {
    contactId: string;
  };
};

export type Events = ScrapingJobEvent | ScoreCreatorsEvent | SendEmailEvent;
