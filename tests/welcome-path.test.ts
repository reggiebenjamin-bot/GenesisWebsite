import assert from "node:assert/strict";
import test from "node:test";
import { isManagedWelcome, welcomeReadyCopy } from "../lib/welcomePath.ts";

/* The three dash characters that must never appear in visitor copy. */
const DASHES = ["-", "–", "—"];
/* Any emoji or pictographic character is banned from visitor copy. */
const EMOJI = /\p{Extended_Pictographic}/u;

test("managed plans and the managed kind take the managed welcome path", () => {
  assert.equal(isManagedWelcome("managed-750"), true);
  assert.equal(isManagedWelcome("managed-1750"), true);
  assert.equal(isManagedWelcome("managed-4500"), true);
  assert.equal(isManagedWelcome("single", "managed"), true);
  assert.equal(isManagedWelcome("", "managed"), true);
});

test("the AI Employees plans, tools and unknown ids take the ready path", () => {
  assert.equal(isManagedWelcome("single"), false);
  assert.equal(isManagedWelcome("duo"), false);
  assert.equal(isManagedWelcome("fleet"), false);
  assert.equal(isManagedWelcome("deal-architect"), false);
  assert.equal(isManagedWelcome("real_estate"), false);
  assert.equal(isManagedWelcome(""), false);
  assert.equal(isManagedWelcome("", "tools"), false);
});

test("ready path copy contains no dash or emoji characters", () => {
  for (const [key, text] of Object.entries(welcomeReadyCopy)) {
    const isUrl = text.startsWith("http://") || text.startsWith("https://");
    if (isUrl) continue;
    for (const dash of DASHES) {
      assert.equal(text.includes(dash), false, `welcomeReadyCopy.${key} contains "${dash}": ${text}`);
    }
    assert.equal(EMOJI.test(text), false, `welcomeReadyCopy.${key} contains an emoji: ${text}`);
  }
});
