import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import { Toolbar } from "../components/Toolbar";

describe("Toolbar", () => {
  it("tabs to controls without stopping on the scrolling toolbar", async () => {
    const user = userEvent.setup();
    render(<Toolbar wrap={false}><button>First</button><button>Last</button></Toolbar>);
    expect(screen.getByRole("toolbar")).toHaveAttribute("tabindex", "-1");
    await user.tab();
    expect(screen.getByText("First")).toHaveFocus();
    await user.tab();
    expect(screen.getByText("Last")).toHaveFocus();
  });

  it("renders a named horizontal toolbar at the requested size", () => {
    render(
      <Toolbar ariaLabel="Editor actions" size="lg">
        <button type="button">Bold</button>
      </Toolbar>,
    );

    const toolbar = screen.getByRole("toolbar", { name: "Editor actions" });
    expect(toolbar).toHaveAttribute("aria-orientation", "horizontal");
    expect(toolbar).toHaveAttribute("data-size", "lg");
    expect(toolbar).toHaveClass("min-h-14");
  });

  it("moves focus between controls with horizontal arrow keys", () => {
    render(
      <Toolbar>
        <button type="button">First</button>
        <button type="button" disabled>Disabled</button>
        <button type="button">Last</button>
      </Toolbar>,
    );

    const first = screen.getByRole("button", { name: "First" });
    const last = screen.getByRole("button", { name: "Last" });
    first.focus();

    fireEvent.keyDown(first, { key: "ArrowRight" });
    expect(last).toHaveFocus();

    fireEvent.keyDown(last, { key: "ArrowRight" });
    expect(first).toHaveFocus();
  });
});
