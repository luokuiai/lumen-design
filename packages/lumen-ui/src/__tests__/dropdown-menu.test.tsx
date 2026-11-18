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
    expect(menu.firstElementChild).toHaveClass("min-w-[180px]", "max-w-[320px]");
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
    expect(menu.firstElementChild).toHaveStyle({ transformOrigin: "right top" });
  });

  it.each([
    { align: "left" as const, dropUp: false },
    { align: "right" as const, dropUp: false },
    { align: "left" as const, dropUp: true },
    { align: "right" as const, dropUp: true },
  ])("matches opening and closing motion to placement (align=$align, up=$dropUp)", ({ align, dropUp }) => {
    vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(160);
    vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(120);

    render(
      <DropdownMenu
        align={align}
        trigger={({ toggle }) => <button onClick={toggle}>Open</button>}
      >
        <div>Menu content</div>
      </DropdownMenu>,
    );

    const trigger = screen.getByRole("button", { name: "Open" });
    const top = dropUp ? window.innerHeight - 60 : 40;
    vi.spyOn(trigger, "getBoundingClientRect").mockReturnValue({
      bottom: top + 30,
      height: 30,
      left: 100,
      right: 180,
      top,
      width: 80,
      x: 100,
      y: top,
      toJSON: () => ({}),
    });

    fireEvent.click(trigger);

    const menu = screen.getByTestId("dropdown-menu");
    const surface = menu.firstElementChild;
    const transformOrigin = `${align} ${dropUp ? "bottom" : "top"}`;
    expect(menu).toHaveStyle({
      top: `${dropUp ? top - 128 : top + 38}px`,
    });
    expect(surface).toHaveStyle({
      animation: `lumen-dropdown-in${dropUp ? "-up" : ""} 0.12s ease-out`,
      transformOrigin,
    });

    fireEvent.click(trigger);

    expect(menu).toHaveAttribute("data-state", "closing");
    expect(surface).toHaveStyle({
      animation: `lumen-dropdown-out${dropUp ? "-up" : ""} 0.12s ease-in forwards`,
      transformOrigin,
    });
  });

  it("updates motion direction when the open menu is repositioned", () => {
    vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(160);
    vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(120);

    render(
      <DropdownMenu trigger={({ toggle }) => <button onClick={toggle}>Open</button>}>
        <div>Menu content</div>
      </DropdownMenu>,
    );

    const trigger = screen.getByRole("button", { name: "Open" });
    let top = window.innerHeight - 60;
    vi.spyOn(trigger, "getBoundingClientRect").mockImplementation(() => ({
      bottom: top + 30,
      height: 30,
      left: 100,
      right: 180,
      top,
      width: 80,
      x: 100,
      y: top,
      toJSON: () => ({}),
    }));

    fireEvent.click(trigger);
    const surface = screen.getByTestId("dropdown-menu").firstElementChild;
    expect(surface).toHaveStyle({ transformOrigin: "left bottom" });

    top = 40;
    fireEvent(window, new Event("resize"));

    expect(screen.getByTestId("dropdown-menu")).toHaveStyle({ top: "78px" });
    expect(surface).toHaveStyle({
      animation: "lumen-dropdown-in 0.12s ease-out",
      transformOrigin: "left top",
    });
    fireEvent.click(trigger);
    expect(surface).toHaveStyle({
      animation: "lumen-dropdown-out 0.12s ease-in forwards",
      transformOrigin: "left top",
    });
  });

  it("provides an accessible styled menu item", () => {
    render(<DropdownMenuItem disabled>Delete</DropdownMenuItem>);

    const item = screen.getByRole("menuitem", { name: "Delete" });
    expect(item).toBeDisabled();
    expect(item).toHaveClass("min-h-[38px]", "font-normal");
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
