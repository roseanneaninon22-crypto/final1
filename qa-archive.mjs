tungod // Opens the admin dashboard Services page, deletes one service, and checks the Archive page.
export default async function run(page, ui) {
  const out = {};
  await page.evaluate(() => localStorage.removeItem("salon-admin-service-archive"));
  await page.getByRole("button", { name: "Log In", exact: true }).first().click();
  await page.waitForTimeout(1200);
  await page.getByPlaceholder("Enter your email").fill("maria@example.com");
  await page.getByPlaceholder("Enter your password").fill("password123");
  await page.getByRole("button", { name: "LOG IN" }).click();
  await page.waitForTimeout(4000);
  out.afterLoginH1 = await page.locator("h1").first().innerText().catch(e => "ERR " + e.message);

  await page.getByRole("button", { name: /Services/ }).first().click().catch(e => { out.navErr = e.message; });
  await page.waitForTimeout(1500);
  out.cardsBefore = await page.locator(".admin-service-grid .landing-service").count();
  out.cardWidths = await page.locator(".admin-service-grid .landing-service").evaluateAll(els =>
    els.slice(0, 4).map(el => Math.round(el.getBoundingClientRect().width))
  );
  out.cardTops = await page.locator(".admin-service-grid > div").evaluateAll(els =>
    els.slice(0, 4).map(el => Math.round(el.getBoundingClientRect().top))
  );

  page.once("dialog", d => d.accept());
  await page.locator(".admin-service-grid button[aria-label^='Delete']").first().click();
  await page.waitForTimeout(1200);
  out.cardsAfter = await page.locator(".admin-service-grid .landing-service").count();
  out.storedArchive = await page.evaluate(() => localStorage.getItem("salon-admin-service-archive"));

  await page.getByRole("button", { name: /Archive/ }).first().click();
  await page.waitForTimeout(1200);
  out.archiveRows = await page.locator("text=Restore").count();
  out.archiveText = await page.locator(".admin-content").innerText().catch(e => "ERR " + e.message);
  return out;
}
