import { FiInfo } from "react-icons/fi";

export function Information(input: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <aside className="common-information">
      <FiInfo aria-hidden="true" />
      <div>
        <strong>{input.title}</strong>
        <div>{input.children}</div>
      </div>
    </aside>
  );
}
