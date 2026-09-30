import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Tabs } from "../components/Tabs";

const options = [
  { label: "Overview", value: "overview" },
  { label: "Activity", value: "activity" },
];

describe("Tabs", () => {
  it.each(["default", "pill", "square"] as const)("keeps keyboard focus separate from selection in %s tabs", async (variant) => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Tabs value="overview" options={options} variant={variant} onChange={onChange} />);

    expect(screen.getByRole("tablist")).toHaveAttribute("tabindex", "-1");
    await user.tab();
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveFocus();
    await user.tab();
    const activity = screen.getByRole("tab", { name: "Activity" });
    expect(activity).toHaveFocus();
    expect(activity).toHaveAttribute("aria-selected", "false");
    expect(onChange).not.toHaveBeenCalled();

    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenLastCalledWith("activity");
    onChange.mockClear();
    await user.keyboard(" ");
    expect(onChange).toHaveBeenCalledExactlyOnceWith("activity");
  });

  it("uses the line treatment by default", () => {
    render(
      <Tabs value="overview" options={options} onChange={() => undefined} />,
    );

    expect(screen.getByRole("tab", { name: "Overview" })).toHaveClass(
      "after:bg-[var(--lumen-color-primary)]",
      "after:bottom-0",
      "after:h-[2px]",
    );
    expect(screen.getByRole("tablist")).toHaveClass(
      "overflow-x-auto",
      "overflow-y-hidden",
    );
  });

  it("keeps the pill variant available", () => {
    const { container } = render(
      <Tabs
        value="overview"
        options={options}
        variant="pill"
        onChange={() => undefined}
      />,
    );

    expect(screen.getByRole("tab", { name: "Overview" })).toHaveClass(
      "rounded-full",
    );
    expect(container.firstElementChild).toHaveClass("bg-transparent");
  });

  it("uses a compact flat treatment for square tabs", () => {
    const { container } = render(
      <Tabs
        value="overview"
        options={[
          { label: "Overview", value: "overview", count: 12 },
          { label: "Activity", value: "activity", count: 4 },
        ]}
        variant="square"
        size="sm"
        onChange={() => undefined}
      />,
    );

    expect(container.firstElementChild).toHaveClass("bg-transparent");
    expect(screen.getByRole("tab", { name: "Overview 12" })).toHaveClass(
      "bg-[var(--lumen-color-primary-soft)]",
      "border-[color-mix(in_srgb,var(--lumen-color-primary)_45%,transparent)]",
      "min-h-9",
      "py-1.5",
      "rounded-[6px]",
    );
    expect(screen.getByText("12")).toHaveClass(
      "text-[var(--lumen-color-primary)]",
    );
    expect(screen.getByText("4")).toHaveClass(
      "text-[var(--lumen-color-text-muted)]",
      "group-hover:text-[var(--lumen-color-primary)]",
    );
  });

  it("links tabs to panels with a shared id prefix", () => {
    render(
      <Tabs
        value="overview"
        options={options}
        idPrefix="account"
        onChange={() => undefined}
      />,
    );

    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute(
      "id",
      "account-tab-overview",
    );
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute(
      "aria-controls",
      "account-panel-overview",
    );
  });

  it("scrolls a newly active tab into horizontal view", () => {
    const { rerender } = render(
      <Tabs value="overview" options={options} onChange={() => undefined} />,
    );
    const tabList = screen.getByRole("tablist");
    const activityTab = screen.getByRole("tab", { name: "Activity" });
    const scrollTo = vi.fn();
    tabList.scrollTo = scrollTo;
    Object.defineProperty(tabList, "clientWidth", { configurable: true, value: 200 });
    Object.defineProperty(tabList, "scrollWidth", { configurable: true, value: 400 });
    Object.defineProperty(tabList, "scrollLeft", { configurable: true, value: 10 });
    vi.spyOn(tabList, "getBoundingClientRect").mockReturnValue({
      left: 0,
      right: 200,
    } as DOMRect);
    vi.spyOn(activityTab, "getBoundingClientRect").mockReturnValue({
      left: 220,
      right: 300,
    } as DOMRect);

    rerender(
      <Tabs value="activity" options={options} onChange={() => undefined} />,
    );

    expect(scrollTo).toHaveBeenCalledWith({ left: 114, behavior: "smooth" });
  });
});
