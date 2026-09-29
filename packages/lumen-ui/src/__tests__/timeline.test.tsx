import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Timeline } from "../components/Timeline";

describe("Timeline", () => {
  it("renders a custom item icon in place of the default marker", () => {
    const { container, getByTestId } = render(
      <Timeline
        items={[
          {
            id: "1",
            date: "2026-08-21",
            title: "Created",
            icon: <span data-testid="custom-timeline-icon">icon</span>,
          },
        ]}
      />,
    );

    expect(getByTestId("custom-timeline-icon")).toBeInTheDocument();
    expect(container.querySelector("[data-timeline-marker] .rounded-full")).not.toBeInTheDocument();
  });

  it("renders custom content in place of the default item content", () => {
    const { getByText, queryByText } = render(
      <Timeline
        items={[
          {
            id: "1",
            date: "2026-08-21",
            title: "Created",
            content: <span>Custom content</span>,
          },
        ]}
      />,
    );

    expect(getByText("Custom content")).toBeInTheDocument();
    expect(queryByText("Created")).not.toBeInTheDocument();
  });

  it("keeps an even gap around markers and uses a two-pixel connector", () => {
    const { container } = render(
      <Timeline
        items={[
          { id: "1", date: "2026-08-21", title: "Created" },
          { id: "2", date: "2026-08-22", title: "Reviewed" },
        ]}
      />,
    );

    const connector = container.querySelector("[data-timeline-connector]");
    expect(connector).toHaveClass(
      "left-[6px]",
      "top-[22px]",
      "bottom-0",
      "w-[2px]",
      "opacity-[0.45]",
    );
    expect(connector?.parentElement).toHaveAttribute("data-timeline-item");
    expect(container.querySelector("[data-timeline-content]")).toHaveClass(
      "border-[var(--lumen-color-border)]",
    );
  });
});
