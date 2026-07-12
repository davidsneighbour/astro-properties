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

const rangeIndex = {
  price: { min: 100_000, max: 500_000, buckets: [] },
  area: { min: 50, max: 350, buckets: [] },
  listings: [
    { id: "seaview-villa", price: 450_000, areaSize: 320 },
    { id: "downtown-condo", price: 150_000, areaSize: 80 },
  ],
};

function mockRangeIndexFetch() {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ json: async () => rangeIndex }),
  );
}

describe("SearchFilters", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
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

  it("renders price/area range sliders once the JSON range index loads", async () => {
    mockRangeIndexFetch();
    init.mockResolvedValue(undefined);
    search.mockResolvedValue({ results: [] });

    render(<SearchFilters {...props} />);

    expect(await screen.findByLabelText("Minimum price")).toBeInTheDocument();
    expect(screen.getByLabelText("Maximum price")).toBeInTheDocument();
    expect(screen.getByLabelText("Minimum area")).toBeInTheDocument();
    expect(screen.getByLabelText("Maximum area")).toBeInTheDocument();
    expect(screen.getByText("$100,000 – $500,000")).toBeInTheDocument();
  });

  it("narrows results by area range, and clamps the min thumb when it would cross the max thumb", async () => {
    mockRangeIndexFetch();
    init.mockResolvedValue(undefined);
    search.mockResolvedValue({
      results: [
        resultStub("seaview-villa", { title: "Seaview Villa" }),
        resultStub("downtown-condo", { title: "Downtown Condo" }),
      ],
    });

    render(<SearchFilters {...props} />);
    await waitFor(() =>
      expect(screen.getByLabelText("Minimum area")).toBeInTheDocument(),
    );

    fireEvent.change(screen.getByLabelText("Minimum area"), {
      target: { value: "100" },
    });

    await waitFor(() =>
      expect(screen.getByText("1 listing found")).toBeInTheDocument(),
    );
    expect(screen.getByText("Seaview Villa")).toBeInTheDocument();

    // Dragging the min thumb past the max thumb clamps it to the max, not past it.
    fireEvent.change(screen.getByLabelText("Minimum area"), {
      target: { value: "1000" },
    });
    expect(screen.getByLabelText("Minimum area")).toHaveValue("350");
  });

  it("narrows results by price range client-side, without re-querying Pagefind", async () => {
    mockRangeIndexFetch();
    init.mockResolvedValue(undefined);
    search.mockResolvedValue({
      results: [
        resultStub("seaview-villa", {
          title: "Seaview Villa",
          price: "$450,000",
        }),
        resultStub("downtown-condo", {
          title: "Downtown Condo",
          price: "$150,000",
        }),
      ],
    });

    render(<SearchFilters {...props} />);

    expect(await screen.findByText("2 listings found")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByLabelText("Maximum price")).toBeInTheDocument(),
    );
    search.mockClear();

    fireEvent.change(screen.getByLabelText("Maximum price"), {
      target: { value: "300000" },
    });

    await waitFor(() =>
      expect(screen.getByText("1 listing found")).toBeInTheDocument(),
    );
    expect(screen.getByText("Downtown Condo")).toBeInTheDocument();
    expect(screen.queryByText("Seaview Villa")).not.toBeInTheDocument();
    expect(search).not.toHaveBeenCalled();
  });

  it("restores the full price/area range when Reset is clicked", async () => {
    mockRangeIndexFetch();
    init.mockResolvedValue(undefined);
    search.mockResolvedValue({
      results: [
        resultStub("seaview-villa", {
          title: "Seaview Villa",
          price: "$450,000",
        }),
        resultStub("downtown-condo", {
          title: "Downtown Condo",
          price: "$150,000",
        }),
      ],
    });

    render(<SearchFilters {...props} />);
    await waitFor(() =>
      expect(screen.getByLabelText("Maximum price")).toBeInTheDocument(),
    );

    fireEvent.change(screen.getByLabelText("Maximum price"), {
      target: { value: "300000" },
    });
    await waitFor(() =>
      expect(screen.getByText("1 listing found")).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));

    await waitFor(() =>
      expect(screen.getByText("2 listings found")).toBeInTheDocument(),
    );
  });

  it("paginates results (page size 6) and steps through pages with Previous/Next", async () => {
    init.mockResolvedValue(undefined);
    search.mockResolvedValue({
      results: Array.from({ length: 7 }, (_, i) =>
        resultStub(`listing-${i}`, { title: `Listing ${i}` }),
      ),
    });

    render(<SearchFilters {...props} />);

    expect(await screen.findByText("7 listings found")).toBeInTheDocument();
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
    expect(screen.getByText("Listing 0")).toBeInTheDocument();
    expect(screen.queryByText("Listing 6")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
    expect(screen.getByText("Listing 6")).toBeInTheDocument();
    expect(screen.queryByText("Listing 0")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
  });

  it("does not show pagination controls when everything fits on one page", async () => {
    init.mockResolvedValue(undefined);
    search.mockResolvedValue({
      results: [resultStub("seaview-villa", { title: "Seaview Villa" })],
    });

    render(<SearchFilters {...props} />);

    expect(await screen.findByText("1 listing found")).toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: "Search results pagination" }),
    ).not.toBeInTheDocument();
  });

  it("resets to page 1 when the query changes", async () => {
    init.mockResolvedValue(undefined);
    search.mockResolvedValue({
      results: Array.from({ length: 7 }, (_, i) =>
        resultStub(`listing-${i}`, { title: `Listing ${i}` }),
      ),
    });

    render(<SearchFilters {...props} />);
    await screen.findByText("Page 1 of 2");

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(await screen.findByText("Page 2 of 2")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Search"), {
      target: { value: "villa" },
    });

    await waitFor(() =>
      expect(screen.getByText("Page 1 of 2")).toBeInTheDocument(),
    );
  });
});
