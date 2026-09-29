const SCRIPT_ID = "funding-radar-links";

async function syncScript() {
  const { siteOrigin } = await chrome.storage.local.get("siteOrigin");
  const registered = await chrome.scripting.getRegisteredContentScripts();
  if (registered.length) {
    await chrome.scripting.unregisterContentScripts({ ids: registered.map(script => script.id) });
  }
  if (!siteOrigin) return;

  const url = new URL(siteOrigin);
  const match = `${url.protocol}//${url.hostname}/*`;
  if (!(await chrome.permissions.contains({ origins: [match] }))) return;

  await chrome.scripting.registerContentScripts([{
    id: SCRIPT_ID,
    matches: [match],
    js: ["linking.js", "content.js"],
    css: ["content.css"],
    runAt: "document_idle",
    persistAcrossSessions: true
  }]);
}

chrome.runtime.onInstalled.addListener(() => { syncScript().catch(console.error); });
chrome.runtime.onStartup.addListener(() => { syncScript().catch(console.error); });
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "sync-script") return;
  syncScript().then(() => sendResponse({ ok: true }), error => sendResponse({ ok: false, error: String(error) }));
  return true;
});
