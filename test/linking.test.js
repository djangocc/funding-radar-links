const test = require("node:test");
const assert = require("node:assert/strict");
const { readCard, makeRadarUrl, normalizeSymbol } = require("../linking.js");

function card(symbol, colors, exchanges = ["aster", "binance"]) {
  const nameElement = { textContent: symbol };
  const tags = colors.map((color, index) => ({
    textContent: exchanges[index],
    classList: { contains: name => name === `ant-tag-${color}` }
  }));
  const row = {
    textContent: `交易所: ${exchanges.join(" ")}`,
    querySelectorAll: selector => selector === ".ant-tag" ? tags : []
  };
  return {
    querySelector: selector => selector === ".ant-card-head .pair-name-link" ? nameElement : null,
    querySelectorAll: selector => selector === "p" ? [row] : []
  };
}

test("reads each leg in its displayed order", () => {
  for (const [colors, expected] of [
    [["gold", "gold"], "FF"],
    [["gold", "green"], "FS"],
    [["green", "gold"], "SF"]
  ]) {
    const details = readCard(card("Q", colors));
    assert.equal(details.mode, expected);
    assert.deepEqual(details.exchanges, ["aster", "binance"]);
  }
});

test("constructs the requested radar URL", () => {
  const url = makeRadarUrl(readCard(card("Q", ["gold", "gold"])));
  assert.equal(url, "https://47.79.37.237/radar/?tab=FF&mode=FF&q=Q&combo=FF.Q.aster.binance");
});

test("uses a configured Radar site while keeping the /radar/ path", () => {
  const url = makeRadarUrl(readCard(card("Q", ["gold", "green"])), "https://radar.example.com/other/path");
  assert.equal(url, "https://radar.example.com/radar/?tab=FS&mode=FS&q=Q&combo=FS.Q.aster.binance");
});

test("removes a decorative emoji and safely encodes symbols", () => {
  assert.equal(normalizeSymbol("🟪 SKHY-SKHYNIX"), "SKHY-SKHYNIX");
  const url = new URL(makeRadarUrl(readCard(card("龙虾", ["green", "gold"]))));
  assert.equal(url.searchParams.get("q"), "龙虾");
  assert.equal(url.searchParams.get("combo"), "SF.龙虾.aster.binance");
});

test("skips cards with unknown market types", () => {
  assert.equal(readCard(card("Q", ["blue", "gold"])), null);
});
