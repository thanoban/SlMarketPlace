export interface ScrapedEvent {
  title: string;
  description: string;
  sourceUrl: string;
  bannerImageUrl?: string;
  mode: "online" | "physical";
  district?: string;
  venue?: string;
  onlineLink?: string;
  registrationUrl: string;
  startDatetime: Date;
  endDatetime: Date;
  goLiveAt: Date;
  rawTags: string[];
  sourceName: "devpost" | "eventbrite" | "hackerearth" | "mlh" | "ctftime";
}
