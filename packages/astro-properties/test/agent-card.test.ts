import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";
import AgentCard from "../src/components/AgentCard.astro";
import type { Agent } from "../src/schema.js";

function agent(overrides: Partial<Agent> = {}): Agent {
  return { name: "Jane Doe", socials: {}, ...overrides };
}

describe("AgentCard", () => {
  it("renders the agent's name", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(AgentCard, {
      props: { agent: agent() },
    });
    expect(result).toContain("Jane Doe");
  });

  it("renders phone and email as tel:/mailto: links when present", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(AgentCard, {
      props: {
        agent: agent({ phone: "+66812345678", email: "jane@example.com" }),
      },
    });
    expect(result).toContain('href="tel:+66812345678"');
    expect(result).toContain('href="mailto:jane@example.com"');
  });

  it("renders a WhatsApp link derived from the whatsapp number", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(AgentCard, {
      props: { agent: agent({ whatsapp: "+66 81 234 5678" }) },
    });
    expect(result).toContain('href="https://wa.me/66812345678"');
  });

  it("renders social links from the socials record", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(AgentCard, {
      props: {
        agent: agent({
          socials: { instagram: "https://instagram.com/example" },
        }),
      },
    });
    expect(result).toContain('href="https://instagram.com/example"');
    expect(result).toContain("instagram");
  });

  it("renders the photo when present", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(AgentCard, {
      props: { agent: agent({ photo: "/agents/jane.jpg" }) },
    });
    expect(result).toContain('src="/agents/jane.jpg"');
  });

  it("omits whatsapp, socials, photo, title, bio, phone, and email when absent", async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(AgentCard, {
      props: { agent: agent() },
    });
    expect(result).not.toContain("wa.me");
    expect(result).not.toContain("tel:");
    expect(result).not.toContain("mailto:");
    expect(result).not.toContain("<img");
  });
});
