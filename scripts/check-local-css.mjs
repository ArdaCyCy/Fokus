const base = "http://localhost:3000";

const home = await fetch(base);
const html = await home.text();
const match = html.match(/href="([^"]*\.css[^"]*)"/i);

if (!match) {
  console.log("NO_CSS_LINK");
  process.exit(0);
}

const cssUrl = new URL(match[1], base).toString();
const cssRes = await fetch(cssUrl);
console.log("CSS_URL", cssUrl);
console.log("CSS_STATUS", cssRes.status);
const cssText = await cssRes.text();
console.log("CSS_LEN", cssText.length);

