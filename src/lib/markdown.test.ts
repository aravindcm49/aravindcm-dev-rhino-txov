import { describe, expect, it } from "vitest";
import { renderMarkdown } from "./markdown";

describe("renderMarkdown", () => {
  it("renders paragraphs", () => {
    expect(renderMarkdown("Hello world")).toContain("<p>Hello world</p>");
  });

  it("renders headings", () => {
    expect(renderMarkdown("# Title")).toContain("<h1");
    expect(renderMarkdown("## Subtitle")).toContain("<h2");
  });

  it("renders links", () => {
    expect(renderMarkdown("[link](https://example.com)")).toContain(
      '<a href="https://example.com"',
    );
  });

  it("renders code blocks", () => {
    const md = "```js\nconst x = 1;\n```";
    expect(renderMarkdown(md)).toContain("<code");
  });

  it("renders empty string to empty output", () => {
    expect(renderMarkdown("")).toBe("");
  });
});
