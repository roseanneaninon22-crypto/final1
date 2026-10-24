// Opens the admin dashboard, goes to Services, and screenshots the service cards.
export default async function run(page, ui) {
  const out = {};
  await page.getByRole("button", { name: "Log In", exact: true }).first().click();
  await page.waitForTimeout(1500);
  await page.getByPlaceholder("Enter your email").fill("maria@example.com");
  await page.getByPlaceholder("Enter your password").fill("password123");
  await page.getByRole("button", { name: "LOG IN" }).click();
  await page.waitForTimeout(3000);
  out.h1 = await page.locator("h1").first().innerText().catch(e => "ERR " + e.message);

  const nav = page.getByRole("button", { name: /^\s*(✂️)?\s*Services\s*$/ }).first();
  await nav.click().catch(e => { out.navError = e.message; });
  await page.waitForTimeout(2000);

  out.cards = await page.locator(".admin-service-grid .landing-service").count();
  const box = await page.locator(".admin-service-grid .landing-service").first().boundingBox().catch(() => null);
  out.firstCardBox = box;
  const cards = await page.locator(".admin-service-grid > div").evaluateAll(els =>
    els.slice(0, 3).map(el => ({ h: Math.round(el.getBoundingClientRect().height), x: Math.round(el.getBoundingClientRect().x) }))
  ).catch(e => "ERR " + e.message);
  out.cardLayout = cards;
  return out;
}
