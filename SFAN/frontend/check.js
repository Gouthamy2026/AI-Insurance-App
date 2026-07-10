const { chromium } = require("playwright");
(async () => {
    try {
        const browser = await chromium.launch();
        const page = await browser.newPage();
        page.on("console", msg => console.log("CONSOLE:", msg.type(), msg.text()));
        page.on("pageerror", err => console.log("PAGE ERROR:", err));
        
        await page.goto("file:///" + __dirname.replace(/\\/g, "/") + "/dashboard_broker.html", { waitUntil: "networkidle" });
        await browser.close();
    } catch (e) {
        console.error("Script error:", e);
    }
})();
