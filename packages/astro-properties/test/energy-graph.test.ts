import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";
import EnergyGraph from "../src/components/EnergyGraph.astro";

describe("EnergyGraph", () => {
  it("renders nothing when energy is undefined (missing data)", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(EnergyGraph, { props: {} });

    expect(result).not.toContain("data-energy-graph");
  });

  it("renders nothing when energy is an empty object (no class/current/potential)", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(EnergyGraph, {
      props: { energy: {} },
    });

    expect(result).not.toContain("data-energy-graph");
  });

  it("renders both bars and the rating label when all fields are given", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(EnergyGraph, {
      props: { energy: { class: "C", epcCurrent: 62, epcPotential: 81 } },
    });

    expect(result).toContain("data-energy-graph");
    expect(result).toContain("Energy rating: C");
    expect(result).toContain('data-energy-bar="current"');
    expect(result).toContain("Current: 62");
    expect(result).toContain('data-energy-bar="potential"');
    expect(result).toContain("Potential: 81");
  });

  it("renders only the current bar when potential is missing (partial data)", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(EnergyGraph, {
      props: { energy: { epcCurrent: 62 } },
    });

    expect(result).toContain('data-energy-bar="current"');
    expect(result).not.toContain('data-energy-bar="potential"');
    expect(result).not.toContain("Energy rating:");
  });

  it("renders only the potential bar when current is missing (partial data)", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(EnergyGraph, {
      props: { energy: { epcPotential: 81 } },
    });

    expect(result).not.toContain('data-energy-bar="current"');
    expect(result).toContain('data-energy-bar="potential"');
  });

  it("renders only the rating label when only class is given (partial data)", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(EnergyGraph, {
      props: { energy: { class: "A" } },
    });

    expect(result).toContain("data-energy-graph");
    expect(result).toContain("Energy rating: A");
    expect(result).not.toContain("data-energy-bar");
  });
});
