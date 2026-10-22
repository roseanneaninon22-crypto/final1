export default async function run(page, ui) {
  const out = { steps: [] };

  await page.getByPlaceholder("Enter your email").fill("maria@example.com");
  await page.getByPlaceholder("Enter your password").fill("password123");
  await page.getByRole("button", { name: "LOG IN" }).click();
  await page.waitForTimeout(1500);

  await page.getByRole("button", { name: /Book Now/ }).first().click();
  await page.waitForTimeout(1500);

  const cats = ["Hair", "Nails", "Spa", "Makeup", "Face", "Waxing", "Packages"];
  out.categories = {};
  for (const c of cats) {
    out.categories[c] = await page.getByRole("button", { name: c, exact: true }).count();
  }

  out.heading = await page.locator("h1").first().innerText();


  out.seePrices = await page.getByText("See prices").count();
  out.viewHaircutTypes = await page.getByText(/View haircut types/).count();


  await page.getByRole("button", { name: "Nails", exact: true }).click();
  await page.waitForTimeout(700);
  out.nailsBody = (await page.locator(".card").first().innerText()).slice(0, 400);

  await page.getByText(/View manicure types/).first().click();
  await page.waitForTimeout(700);
  out.manicureTypes = await page.locator("text=/Classic Manicure|Gel Manicure|Acrylic Nails/").allInnerTexts().catch(() => []);
  out.bookNowButtons = await page.getByRole("button", { name: "Book Now" }).count();

  await page.getByRole("button", { name: "Book Now" }).first().click();
  await page.waitForTimeout(700);

  out.summary = (await page.locator("text=BOOKING SUMMARY").locator("..").innerText()).slice(0, 300);
  out.continueLabel = await page.getByRole("button", { name: /Continue/ }).first().innerText();

  return out;
}