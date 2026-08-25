import { appEvents } from "@/events";
export type AnalyticsEvent = {
  name: string;
  at: string;
  properties?: Record<string, string | number | boolean | null>;
};

type AnalyticsSink = (
  event: AnalyticsEvent,
) => void | Promise<void>;

let sink: AnalyticsSink | null = null;

export function configureAnalytics(
  nextSink: AnalyticsSink | null,
) {
  sink = nextSink;
}

export async function trackAnalytics(
  name: string,
  properties?: AnalyticsEvent["properties"],
): Promise<void> {
  const event: AnalyticsEvent = {
    name,
    at: new Date().toISOString(),
    properties,
  };
  appEvents.emit("analytics:tracked", { name });
  await sink?.(event);
}
