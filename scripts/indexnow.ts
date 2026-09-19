/*
 * Tells Bing, Yandex and the other IndexNow engines that the site's pages
 * have changed, so they recrawl without waiting to rediscover them. Run it
 * after a production deploy that changes content:
 *
 *   npm run indexnow
 *
 * The key is public by design: IndexNow proves the site owns it by fetching
 * the matching file, public/<key>.txt, from the live domain.
 */
import { absoluteUrl, seoPages } from "../lib/seo.ts";
import { siteUrl } from "../lib/site.ts";

const KEY = "a24402f857d6c4a4d0494f0f305d146f";

const body = {
  host: new URL(siteUrl).host,
  key: KEY,
  keyLocation: `${siteUrl}/${KEY}.txt`,
  urlList: seoPages.map((page) => absoluteUrl(page.path)),
};

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(body),
});

if (response.ok) {
  console.log(`IndexNow accepted ${body.urlList.length} URLs for ${body.host} (${response.status}).`);
} else {
  console.error(`IndexNow refused the submission: ${response.status} ${await response.text()}`);
  process.exit(1);
}
