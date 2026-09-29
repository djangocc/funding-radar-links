(function (root) {
  "use strict";

  const DEFAULT_RADAR_ORIGIN = "https://47.79.37.237";

  function normalizeSymbol(value) {
    return String(value || "")
      .trim()
      .replace(/^(?:\p{Extended_Pictographic}|\uFE0F|\u200D|\s)+/u, "")
      .trim();
  }

  function legType(classList) {
    if (classList.contains("ant-tag-green")) return "S";
    if (classList.contains("ant-tag-gold")) return "F";
    return null;
  }

  function readCard(card) {
    const nameElement = card.querySelector(".ant-card-head .pair-name-link");
    const symbol = normalizeSymbol(nameElement?.textContent);
    if (!symbol) return null;

    const exchangeRow = Array.from(card.querySelectorAll("p"))
      .find(row => /^交易所\s*[:：]/.test(row.textContent.trim()));
    const tags = exchangeRow?.querySelectorAll(".ant-tag");
    if (!tags || tags.length !== 2) return null;

    const mode = legType(tags[0].classList) + legType(tags[1].classList);
    if (!(["FF", "FS", "SF"].includes(mode))) return null;

    const exchanges = Array.from(tags, tag => tag.textContent.trim().toLowerCase());
    if (exchanges.some(value => !/^[a-z0-9-]+$/.test(value))) return null;
    return { nameElement, symbol, mode, exchanges };
  }

  function makeRadarUrl({ symbol, mode, exchanges }, radarOrigin = DEFAULT_RADAR_ORIGIN) {
    if (!(["FF", "FS", "SF"].includes(mode)) || !symbol || exchanges?.length !== 2) {
      throw new Error("Invalid card details");
    }
    const base = new URL(radarOrigin);
    if (!["http:", "https:"].includes(base.protocol) || !base.hostname) {
      throw new Error("Invalid Radar site address");
    }
    const url = new URL("/radar/", base.origin);
    url.searchParams.set("tab", mode);
    url.searchParams.set("mode", mode);
    url.searchParams.set("q", symbol);
    url.searchParams.set("combo", `${mode}.${symbol}.${exchanges[0]}.${exchanges[1]}`);
    return url.href;
  }

  root.FundingRadarLinking = { normalizeSymbol, readCard, makeRadarUrl, DEFAULT_RADAR_ORIGIN };
  if (typeof module !== "undefined") module.exports = root.FundingRadarLinking;
})(globalThis);
