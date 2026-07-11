import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HeaderActions } from "../src/components/HeaderActions";

describe("HeaderActions", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders a 'Compare listings' button", () => {
    render(<HeaderActions />);
    expect(
      screen.getByRole("button", { name: "Compare listings" }),
    ).toBeInTheDocument();
  });

  it("shows a placeholder alert when clicked", () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {
      // suppress the real browser alert during the test
    });
    render(<HeaderActions />);

    fireEvent.click(screen.getByRole("button", { name: "Compare listings" }));

    expect(alertSpy).toHaveBeenCalledWith(
      "Compare view is coming in a later phase.",
    );
  });
});
