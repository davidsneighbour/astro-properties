import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SearchFilters } from "../src/components/SearchFilters";

const init = vi.fn();
const search = vi.fn();

vi.mock("/pagefind/pagefind.js", () => ({
  init: (...args: unknown[]) => init(...args),
  search: (...args: unknown[]) => search(...args),
}));

function resultStub(id: string, meta: Record<string, string>) {
  return {
    id,
    data: async () => ({
      url: `/properties/${id}`,
      excerpt: "A lovely <mark>villa</mark> by the sea.",
      meta,
    }),
  };
}

const props = {
  types: ["villa", "condominium"],
  statuses: ["for-sale", "for-rent"],
  categories: ["residential"],
  locations: ["Koh Samui"],
  bedOptions: [1, 2, 3, 4],
};

describe("SearchFilters", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    init.mockReset();
    search.mockReset();
    document.body.innerHTML = "";
  });

  it("shows an unavailable message when the Pagefind index can't be loaded (e.g. dev mode without a build)", async () => {
    init.mockRejectedValue(new Error("not found"));

    render(<SearchFilters {...props} />);

    expect(
      await screen.findByText(/Live search needs a production build/i),
    ).toBeInTheDocument();
  });

  it("initializes Pagefind, searches on mount, and renders results", async () => {
    init.mockResolvedValue(undefined);
    search.mockResolvedValue({
      results: [
        resultStub("seaview-villa", {
          title: "Seaview Villa",
          price: "$450,000",
          beds: "4",
          baths: "3",
          area: "320 m²",
          image: "/cover.jpg",
        }),
      ],
    });

    render(<SearchFilters {...props} />);

    expect(await screen.findByText("Seaview Villa")).toBeInTheDocument();
    expect(screen.getByText("$450,000")).toBeInTheDocument();
    expect(screen.getByText("1 listing found")).toBeInTheDocument();
  });

  it("hides the static SSR grid once Pagefind is ready", async () => {
    const grid = document.createElement("div");
    grid.id = "static-listings";
    document.body.appendChild(grid);

    init.mockResolvedValue(undefined);
    search.mockResolvedValue({ results: [] });

    render(<SearchFilters {...props} />);

    await waitFor(() => expect(grid.classList.contains("hidden")).toBe(true));
  });

  it("passes the type filter through to pagefind.search", async () => {
    init.mockResolvedValue(undefined);
    search.mockResolvedValue({ results: [] });

    render(<SearchFilters {...props} />);
    await waitFor(() => expect(search).toHaveBeenCalled());
    search.mockClear();

    fireEvent.change(screen.getByLabelText("Type"), {
      target: { value: "condominium" },
    });

    await waitFor(() =>
      expect(search).toHaveBeenCalledWith(
        null,
        expect.objectContaining({ filters: { type: ["condominium"] } }),
      ),
    );
  });

  it("resets all fields when Reset is clicked", async () => {
    init.mockResolvedValue(undefined);
    search.mockResolvedValue({ results: [] });

    render(<SearchFilters {...props} />);
    await waitFor(() => expect(search).toHaveBeenCalled());

    fireEvent.change(screen.getByLabelText("Search"), {
      target: { value: "villa" },
    });
    fireEvent.change(screen.getByLabelText("Type"), {
      target: { value: "villa" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));

    expect(screen.getByLabelText("Search")).toHaveValue("");
    expect(screen.getByLabelText("Type")).toHaveValue("");
  });

  it("shows a 'no results' count when the search returns nothing", async () => {
    init.mockResolvedValue(undefined);
    search.mockResolvedValue({ results: [] });

    render(<SearchFilters {...props} />);

    expect(await screen.findByText("0 listings found")).toBeInTheDocument();
  });
});
