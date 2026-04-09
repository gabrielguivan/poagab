const isLocalEnvironment =
  window.location.protocol === "file:" ||
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "::1";
const supportedThemes = ["editorial", "misteriosa", "brutal"];
const requestedTheme = new URLSearchParams(window.location.search).get("v");
const activeTheme = supportedThemes.includes(requestedTheme) ? requestedTheme : "editorial";

document.body.classList.remove(
  ...supportedThemes.map((theme) => `theme-${theme}`)
);
document.body.classList.add(`theme-${activeTheme}`);

if (!isLocalEnvironment) {
  window.va =
    window.va ||
    function vercelAnalyticsQueue(...args) {
      window.vaq = window.vaq || [];
      window.vaq.push(args);
    };

  if (!document.querySelector('script[src="/_vercel/insights/script.js"]')) {
    const script = document.createElement("script");
    script.src = "/_vercel/insights/script.js";
    script.defer = true;
    document.head.appendChild(script);
  }
}
