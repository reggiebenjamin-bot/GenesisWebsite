import assert from "node:assert/strict";
import test from "node:test";
import { isLinkPreviewAgent, planFromLink } from "../lib/checkoutLink.ts";

const IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const CHROME =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

test("direct link plans resolve only the three managed tiers", () => {
  assert.equal(planFromLink("managed-750"), "managed-750");
  assert.equal(planFromLink("managed-1750"), "managed-1750");
  assert.equal(planFromLink("managed-4500"), "managed-4500");
  assert.equal(planFromLink("750"), "managed-750");
  assert.equal(planFromLink("1750"), "managed-1750");
  assert.equal(planFromLink("4500"), "managed-4500");
  assert.equal(planFromLink("MANAGED-750"), "managed-750");
  for (const bad of ["", null, undefined, "managed-697", "single", "fleet", "697", "deal-architect", "../x"]) {
    assert.equal(planFromLink(bad), "");
  }
});

test("people on phones and desktops open checkout", () => {
  assert.equal(isLinkPreviewAgent(IPHONE), false);
  assert.equal(isLinkPreviewAgent(CHROME), false);
});

test("link previews, scanners and non browsers go to pricing", () => {
  for (const ua of [
    "",
    null,
    "facebookexternalhit/1.1 Facebot Twitterbot/1.0",
    "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)",
    "Mozilla/5.0 (Windows NT 6.1; WOW64) SkypeUriPreview Preview/0.5 skype-url-preview@microsoft.com",
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Mozilla/5.0 (Windows NT 5.1; rv:11.0) Gecko Firefox/11.0 (via ggpht.com GoogleImageProxy)",
    "WhatsApp/2.23.20.0 A",
    "TelegramBot (like TwitterBot)",
    "Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)",
    "LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)",
    "curl/8.5.0",
    "python-requests/2.31",
    "Mozilla/5.0 HeadlessChrome/120.0",
  ]) {
    assert.equal(isLinkPreviewAgent(ua), true, String(ua));
  }
});
