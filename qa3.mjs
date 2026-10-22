export default async function run(page, ui) {
  const out = {};

  await page.getByPlaceholder("Enter your email").fill("maria@example.com");
  await page.getByPlaceholder("Enter your password").fill("password123");
  await page.getByRole("button", { name: "LOG IN" }).click();
  await page.waitForTimeout(1500);
  await page.getByRole("button", { name: "Services", exact: true }).first().click();
  await page.waitForTimeout(1500);

  // Every category should reveal services
  const cats = ["Hair", "Nails", "Spa", "Makeup", "Face", "Waxing", "Packages"];
  out.perCategory = {};
  for (const c of cats) {
    await page.getByRole("button", { name: new RegExp(c) }).first().click();
    await page.waitForTimeout(500);
    const card = await page.locator(".card").first().innerText();
    out.perCategory[c] = card.replace(/\n+/g, " | ").slice(0, 260);
  }

  // Nails -> Manicure -> book "Gel Manicure"
  await page.getByRole("button", { name: /Nails/ }).first().click();
  await page.waitForTimeout(500);
  await page.getByText(/View manicure types/).first().click();
  await page.waitForTimeout(600);
  out.typeRows = await page.locator("text=/Classic Manicure|Gel Manicure|Acrylic Nails|Nail Extension/").allInnerTexts();

  // Book Gel Manicure specifically (2nd Book Now in the list)
  await page.getByRole("button", { name: "Book Now" }).nth(1).click();
  await page.waitForTimeout(800);

  out.summary = (await page.locator("text=BOOKING SUMMARY").locator("..").innerText()).replace(/\n+/g, " | ");
  out.continue = await page.getByRole("button", { name: /Continue/ }).first().innerText();

  // Verify the total carried into the next step (Date & Time shows a summary?)
  await page.getByRole("button", { name: /Continue/ }).first().click();
  await page.waitForTimeout(1500);
  out.nextHeading = await page.locator("h1").first().innerText().catch(e => "ERR " + e.message);
  out.nextBody = (await page.locator("body").innerText()).replace(/\n+/g, " | ").slice(0, 500);

  return out;
}