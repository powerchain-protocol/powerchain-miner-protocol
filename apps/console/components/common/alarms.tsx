import { FiAlertTriangle } from "react-icons/fi";

export type Alarm = {
  id: string;
  title: string;
  detail: string;
  severity: "info" | "warning" | "critical";
};

export function Alarms({ alarms }: { alarms: readonly Alarm[] }) {
  if (!alarms.length) return null;
  return (
    <section className="common-alert-list" aria-label="Operational alarms">
      {alarms.map((alarm) => (
        <article key={alarm.id} data-severity={alarm.severity}>
          <FiAlertTriangle aria-hidden="true" />
          <span>
            <strong>{alarm.title}</strong>
            <small>{alarm.detail}</small>
          </span>
        </article>
      ))}
    </section>
  );
}
