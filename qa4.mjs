export default async function run(page, ui) {
  const out = {};

  await page.getByPlaceholder("Enter your email").fill("maria@example.com");
  await page.getByPlaceholder("Enter your password").fill("password123");
  await page.getByRole("button", { name: "LOG IN" }).click();
  await page.waitForSelector('text=Welcome', { timeout: 20000 });
  await page.waitForTimeout(800);

  await page.getByRole("button", { name: "Services", exact: true }).first().click();
  await page.waitForSelector('h1:has-text("Select Services")', { timeout: 20000 });
  await page.waitForTimeout(600);

  // Book: Nails > Manicure > Gel Manicure (₱550)
  await page.getByRole("button", { name: /Nails/ }).first().click();
  await page.waitForTimeout(400);
  await page.getByText(/View manicure types/).first().click();
  await page.waitForTimeout(600);
  await page.getByRole("button", { name: "Book Now" }).nth(1).click();
  await page.waitForTimeout(600);
  out.summary = (await page.locator("text=BOOKING SUMMARY").locator("..").innerText()).replace(/\n+/g, " | ");

  await page.getByRole("button", { name: /Continue/ }).first().click();
  await page.waitForSelector('h1:has-text("Select Date")', { timeout: 20000 });
  await page.waitForTimeout(500);

  await page.getByText("15", { exact: true }).first().click();
  await page.waitForTimeout(400);
  await page.getByRole("button", { name: "10:00 AM" }).first().click();
  await page.waitForTimeout(400);
  await page.getByRole("button", { name: /Continue/ }).first().click();
  await page.waitForSelector('h1:has-text("Stylist")', { timeout: 20000 });
  await page.waitForTimeout(600);

  out.stylistHeading = await page.locator("h1").first().innerText();
  await page.locator(".card").first().click();
  await page.waitForTimeout(400);
  await page.getByRole("button", { name: /Continue/ }).first().click();
  await page.waitForSelector('text=Your Details', { timeout: 20000 });
  await page.waitForTimeout(600);

  const body = await page.locator("body").innerText();
  out.detailsHasType = (body.match(/Gel Manicure[^\n]*/g) || []).slice(0, 3);
  out.detailsPrices = (body.match(/₱\d+/g) || []).slice(0, 6);

  const inputs = page.locator("input");
  const n = await inputs.count();
  for (let i = 0; i < n; i++) {
    const ph = (await inputs.nth(i).getAttribute("placeholder")) || "";
    if (/name/i.test(ph)) await inputs.nth(i).fill("Maria Santos");
    if (/phone/i.test(ph)) await inputs.nth(i).fill("09171234567");
  }
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: /Confirm/i }).first().click();
  await page.waitForTimeout(2000);

  out.confirmHeading = await page.locator("h1").first().innerText().catch(() => "ERR");
  out.confirmBody = (await page.locator("body").innerText()).replace(/\n+/g, " | ").slice(0, 800);
  out.saved = await page.evaluate(() => localStorage.getItem("salon_bookings"));

  return out;
}