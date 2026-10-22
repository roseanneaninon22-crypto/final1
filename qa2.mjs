export default async function run(page, ui) {
  const out = {};

  await page.getByPlaceholder("Enter your email").fill("maria@example.com");
  await page.getByPlaceholder("Enter your password").fill("password123");
  await page.getByRole("button", { name: "LOG IN" }).click();
  await page.waitForTimeout(2000);

  out.afterLoginHeading = await page.locator("h1").first().innerText().catch(e => "ERR " + e.message);

  // What buttons exist on the home screen?
  out.homeButtons = await page.getByRole("button").allInnerTexts().catch(() => []);

  // Try the Services nav link instead of the hero button
  await page.getByRole("button", { name: "Services", exact: true }).first().click();
  await page.waitForTimeout(2000);

  out.afterServicesHeading = await page.locator("h1").first().innerText().catch(e => "ERR " + e.message);
  out.allButtons = await page.getByRole("button").allInnerTexts().catch(() => []);
  out.bodySnippet = (await page.locator("body").innerText()).slice(0, 600);

  return out;
}