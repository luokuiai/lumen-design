import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Textarea } from "../components/Textarea";

describe("Textarea", () => {
  it("disables resizing by default and allows opting into vertical resizing", () => {
    const { rerender } = render(<Textarea />);

    expect(screen.getByRole("textbox")).toHaveClass("resize-none");
    expect(screen.getByRole("textbox")).not.toHaveClass("resize-y");

    rerender(<Textarea resize="vertical" />);

    expect(screen.getByRole("textbox")).toHaveClass("resize-y");
    expect(screen.getByRole("textbox")).not.toHaveClass("resize-none");
  });

  it("shows the current and maximum character count", () => {
    render(<Textarea defaultValue="abc" maxLength={10} showCount />);

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("maxlength", "10");
    expect(screen.getByText("3/10")).toBeVisible();

    fireEvent.change(textarea, { target: { value: "abcde" } });
    expect(screen.getByText("5/10")).toBeVisible();
  });

  it("does not render a counter by default", () => {
    render(<Textarea defaultValue="abc" maxLength={10} />);

    expect(screen.queryByText("3/10")).not.toBeInTheDocument();
  });
});
