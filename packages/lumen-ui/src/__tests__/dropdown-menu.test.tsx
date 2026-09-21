import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DropdownMenu, DropdownMenuItem } from "../components/DropdownMenu";

describe("DropdownMenu", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("positions the menu from the trigger instead of its stretched container", () => {
    vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(160);
    vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(120);

    render(
      <DropdownMenu
        align="left"
        trigger={({ toggle }) => <button onClick={toggle}>Open</button>}
      >
        <div>Menu content</div>
      </DropdownMenu>,
    );

    const trigger = screen.getByRole("button", { name: "Open" });
    vi.spyOn(trigger, "getBoundingClientRect").mockReturnValue({
      bottom: 70,
      height: 30,
      left: 100,
      right: 180,
      top: 40,
      width: 80,
      x: 100,
      y: 40,
      toJSON: () => ({}),
    });

    fireEvent.click(trigger);

    expect(screen.getByTestId("dropdown-menu")).toHaveClass("z-[90]");
    expect(screen.getByTestId("dropdown-menu")).toHaveStyle({
      left: "100px",
      top: "78px",
    });
    expect(screen.getByTestId("dropdown-menu").firstElementChild).toHaveAttribute(
      "data-ui",
      "dropdown-surface",
    );
  });

  it("opens toward available right space by default without focusing the first item", () => {
    vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(160);
    vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(120);

    render(
      <DropdownMenu
        menuMode
        trigger={({ toggle }) => <button onClick={toggle}>Open</button>}
      >
        <button role="menuitem">First</button>
        <button role="menuitem">Second</button>
      </DropdownMenu>,
    );

    const trigger = screen.getByRole("button", { name: "Open" });
    vi.spyOn(trigger, "getBoundingClientRect").mockReturnValue({
      bottom: 70,
      height: 30,
      left: 100,
      right: 180,
      top: 40,
      width: 80,
      x: 100,
      y: 40,
      toJSON: () => ({}),
    });

    fireEvent.click(trigger);

    const menu = screen.getByRole("menu");
    expect(menu).toHaveStyle({ left: "100px", top: "78px" });
    expect(menu).toHaveAttribute("data-align", "left");
    expect(menu).toHaveFocus();
    expect(menu.firstElementChild).toHaveClass("min-w-40", "max-w-[320px]");
    expect(screen.getByRole("menuitem", { name: "First" })).not.toHaveFocus();
  });

  it("flips left when the menu does not fit on the trigger right side", () => {
    vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(160);
    vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(120);

    render(
      <DropdownMenu
        trigger={({ toggle }) => <button onClick={toggle}>Open</button>}
      >
        <div>Menu content</div>
      </DropdownMenu>,
    );

    const trigger = screen.getByRole("button", { name: "Open" });
    vi.spyOn(trigger, "getBoundingClientRect").mockReturnValue({
      bottom: 70,
      height: 30,
      left: 900,
      right: 980,
      top: 40,
      width: 80,
      x: 900,
      y: 40,
      toJSON: () => ({}),
    });

    fireEvent.click(trigger);

    const menu = screen.getByTestId("dropdown-menu");
    expect(menu).toHaveStyle({ left: "820px", top: "78px" });
    expect(menu).toHaveAttribute("data-align", "right");
    expect(menu.firstElementChild).toHaveClass("origin-top-right");
  });

  it("provides an accessible styled menu item", () => {
    render(<DropdownMenuItem disabled>Delete</DropdownMenuItem>);

    const item = screen.getByRole("menuitem", { name: "Delete" });
    expect(item).toBeDisabled();
    expect(item).toHaveClass("min-h-9", "font-normal");
  });

  it("navigates selectable menu items and activates them with the keyboard", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <DropdownMenu menuMode trigger={({ toggle }) => <button onClick={toggle}>Open</button>}>
        <DropdownMenuItem role="menuitemradio" aria-checked={false} onClick={onSelect}>中文</DropdownMenuItem>
        <DropdownMenuItem role="menuitemradio" aria-checked={false} disabled>Unavailable</DropdownMenuItem>
        <DropdownMenuItem role="menuitemcheckbox" aria-checked={true}>Notifications</DropdownMenuItem>
        <DropdownMenuItem>Account</DropdownMenuItem>
      </DropdownMenu>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    const menu = screen.getByRole("menu");
    const language = screen.getByRole("menuitemradio", { name: "中文" });
    fireEvent.keyDown(menu, { key: "ArrowDown" });
    expect(language).toHaveFocus();
    expect(language).toHaveAttribute("aria-checked", "false");
    fireEvent.keyDown(language, { key: "ArrowDown" });
    expect(screen.getByRole("menuitemcheckbox")).toHaveFocus();
    fireEvent.keyDown(menu, { key: "End" });
    expect(screen.getByRole("menuitem", { name: "Account" })).toHaveFocus();
    fireEvent.keyDown(menu, { key: "Home" });
    expect(language).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledOnce();
  });
});
