/*
 * Minimal client-side BibTeX citations for a dependency-free GitHub Pages site.
 *
 * In a post, write:
 *   <cite data-key="vaswani2017attention"></cite>
 *
 * For multiple sources:
 *   <cite data-key="vaswani2017attention,hoffmann2022training"></cite>
 *
 * Add this empty list where the bibliography should appear:
 *   <ol id="references-list"></ol>
 */
(() => {
  const clean = (value = "") =>
    value
      .replace(/[{}]/g, "")
      .replace(/\\&/g, "&")
      .replace(/\s+/g, " ")
      .trim();

  const readBalanced = (text, start, open, close) => {
    let depth = 0;
    for (let index = start; index < text.length; index += 1) {
      if (text[index] === open) depth += 1;
      if (text[index] === close) depth -= 1;
      if (depth === 0) return index;
    }
    return text.length - 1;
  };

  const parseFields = (text) => {
    const fields = {};
    let index = 0;

    while (index < text.length) {
      while (index < text.length && /[\s,]/.test(text[index])) index += 1;
      const nameStart = index;
      while (index < text.length && /[\w-]/.test(text[index])) index += 1;
      const name = text.slice(nameStart, index).toLowerCase();
      while (index < text.length && /\s/.test(text[index])) index += 1;
      if (!name || text[index] !== "=") {
        index += 1;
        continue;
      }

      index += 1;
      while (index < text.length && /\s/.test(text[index])) index += 1;
      let value = "";

      if (text[index] === "{") {
        const end = readBalanced(text, index, "{", "}");
        value = text.slice(index + 1, end);
        index = end + 1;
      } else if (text[index] === '"') {
        const start = index + 1;
        index += 1;
        while (
          index < text.length &&
          (text[index] !== '"' || text[index - 1] === "\\")
        ) {
          index += 1;
        }
        value = text.slice(start, index);
        index += 1;
      } else {
        const start = index;
        while (index < text.length && text[index] !== ",") index += 1;
        value = text.slice(start, index);
      }

      fields[name] = clean(value);
    }

    return fields;
  };

  const parseBibTeX = (text) => {
    const entries = new Map();
    let cursor = 0;

    while (cursor < text.length) {
      const at = text.indexOf("@", cursor);
      if (at === -1) break;
      const open = text.indexOf("{", at);
      if (open === -1) break;
      const close = readBalanced(text, open, "{", "}");
      const content = text.slice(open + 1, close);
      const comma = content.indexOf(",");

      if (comma !== -1) {
        const key = content.slice(0, comma).trim();
        entries.set(key, parseFields(content.slice(comma + 1)));
      }

      cursor = close + 1;
    }

    return entries;
  };

  const formatAuthors = (author = "") => {
    const names = author.split(/\s+and\s+/i).map((name) => clean(name));
    if (names.length > 4) return `${names[0]} et al.`;
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} and ${names[1]}`;
    return `${names.slice(0, -1).join(", ")}, and ${names.at(-1)}`;
  };

  const appendReference = (list, key, number, entry, backlinks) => {
    const item = document.createElement("li");
    item.id = `ref-${key.replace(/[^\w-]/g, "-")}`;

    if (!entry) {
      item.textContent = `[Missing BibTeX entry: ${key}]`;
      item.className = "citation-error";
      list.appendChild(item);
      return;
    }

    const authors = formatAuthors(entry.author);
    const venue = entry.journal || entry.booktitle || entry.publisher || "";
    const parts = [
      authors,
      entry.title ? `“${entry.title}.”` : "",
      venue,
      entry.year,
    ].filter(Boolean);

    item.append(document.createTextNode(parts.join(" ") + " "));

    const target =
      entry.url || (entry.doi ? `https://doi.org/${entry.doi}` : "");
    if (target) {
      const source = document.createElement("a");
      source.href = target;
      source.target = "_blank";
      source.rel = "noreferrer";
      source.textContent = entry.doi ? "DOI" : "Link";
      item.append(source, document.createTextNode(" "));
    }

    backlinks.forEach((citationId, index) => {
      const back = document.createElement("a");
      back.href = `#${citationId}`;
      back.setAttribute(
        "aria-label",
        `Return to citation ${number}, occurrence ${index + 1}`,
      );
      back.textContent = backlinks.length === 1 ? "↩" : `↩${index + 1}`;
      item.append(back, document.createTextNode(" "));
    });

    list.appendChild(item);
  };

  const renderCitations = async () => {
    const citations = [...document.querySelectorAll("cite[data-key]")];
    const list = document.querySelector("#references-list");
    if (citations.length === 0 || !list) return;

    try {
      const bibPath =
        document.documentElement.dataset.bibliography ||
        "../assets/references.bib";
      const response = await fetch(bibPath);
      if (!response.ok) throw new Error(`Could not load ${bibPath}`);
      const entries = parseBibTeX(await response.text());
      const order = [];
      const numbers = new Map();
      const backlinks = new Map();

      citations.forEach((citation, citationIndex) => {
        const keys = citation.dataset.key
          .split(",")
          .map((key) => key.trim())
          .filter(Boolean);
        const citationId = `cite-${citationIndex + 1}`;
        citation.id = citationId;
        citation.replaceChildren(document.createTextNode("["));

        keys.forEach((key, keyIndex) => {
          if (!numbers.has(key)) {
            numbers.set(key, numbers.size + 1);
            order.push(key);
          }
          if (!backlinks.has(key)) backlinks.set(key, []);
          backlinks.get(key).push(citationId);

          if (keyIndex > 0) citation.append(document.createTextNode(", "));
          const link = document.createElement("a");
          link.href = `#ref-${key.replace(/[^\w-]/g, "-")}`;
          link.setAttribute("aria-label", `Citation ${numbers.get(key)}`);
          link.textContent = numbers.get(key);
          citation.appendChild(link);
        });

        citation.append(document.createTextNode("]"));
      });

      order.forEach((key) => {
        appendReference(
          list,
          key,
          numbers.get(key),
          entries.get(key),
          backlinks.get(key),
        );
      });
    } catch (error) {
      list.innerHTML = "";
      const item = document.createElement("li");
      item.className = "citation-error";
      item.textContent =
        "References could not be loaded. Serve the site through GitHub Pages or a local web server.";
      list.appendChild(item);
      console.error(error);
    }
  };

  renderCitations();
})();
