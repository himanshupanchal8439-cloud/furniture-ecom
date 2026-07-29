const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
  page.on("pageerror", (err) => errors.push("PAGEERROR: " + err.message));

  await page.goto("http://localhost:3000/admin/login", { waitUntil: "load" });
  await page.fill('input[type="email"]', "admin@maison.example");
  await page.fill('input[type="password"]', "Admin123!");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/admin", { timeout: 10000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: "shot_dashboard.png", fullPage: true });
  console.log("dashboard errors so far:", errors.length, errors.join(" | "));

  // Orders detail dialog
  await page.goto("http://localhost:3000/admin/orders", { waitUntil: "load" });
  await page.waitForTimeout(800);
  await page.locator("tbody tr").first().click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: "shot_order_detail.png" });

  // Coupons edit
  await page.goto("http://localhost:3000/admin/coupons", { waitUntil: "load" });
  await page.waitForTimeout(800);
  const couponEditBtn = page.locator("tbody tr button").first();
  if (await couponEditBtn.count() > 0) {
    await couponEditBtn.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: "shot_coupon_edit.png" });
    await page.keyboard.press("Escape");
  }

  // Users drawer
  await page.goto("http://localhost:3000/admin/users", { waitUntil: "load" });
  await page.waitForTimeout(800);
  await page.locator('button:has(svg)').last().click().catch(() => {});
  await page.waitForTimeout(600);
  await page.screenshot({ path: "shot_user_orders.png" });

  // Products bulk select
  await page.goto("http://localhost:3000/admin/products", { waitUntil: "load" });
  await page.waitForTimeout(800);
  const checkboxes = await page.locator('tbody [role="checkbox"], tbody button[data-slot="checkbox"]').all();
  console.log("checkbox count:", checkboxes.length);
  if (checkboxes.length > 0) {
    await checkboxes[0].click();
    await checkboxes[1]?.click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: "shot_bulk_actions.png" });
  }

  // Mobile drawer
  await page.setViewportSize({ width: 500, height: 900 });
  await page.goto("http://localhost:3000/admin", { waitUntil: "load" });
  await page.waitForTimeout(600);
  await page.screenshot({ path: "shot_mobile_closed.png" });
  await page.locator("header button").first().click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: "shot_mobile_drawer.png" });

  console.log("TOTAL errors:", errors.length);
  if (errors.length) console.log(errors.join("\n"));
  await browser.close();
})();
