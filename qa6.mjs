export default async function run(page, ui) {
  const out = {};

  await page.getByPlaceholder("Enter your email").fill("maria@example.com");
  await page.getByPlaceholder("Enter your password").fill("password123");
  await page.getByRole("button", { name: "LOG IN" }).click();
  await page.waitForSelector("text=Welcome", { timeout: 20000 });
  await page.waitForTimeout(800);

  await page.getByRole("button", { name: "Services", exact: true }).first().click();
  await page.waitForSelector('h1:has-text("Select Services")', { timeout: 20000 });
  await page.waitForTimeout(600);

  await page.getByRole("button", { name: /Nails/ }).first().click();
  await page.waitForTimeout(400);
  await page.getByText(/View manicure types/).first().click();
  await page.waitForTimeout(600);
  await page.getByRole("button", { name: "Book Now" }).nth(1).click();
  await page.waitForTimeout(600);
  out.summary = (await page.locator("text=BOOKING SUMMARY").locator("..").innerText()).replace(/\n+/g, " | ");

  await page.getByRole("button", { name: /Continue/ }).first().click();
  await page.waitForSelector('h1:has-text("Select Date")', { timeout: 20000 });
  await page.waitForTimeout(600);

  // A real, selectable day: has text, is not .empty and not .past
  const day = page.locator(".cal-day:not(.empty):not(.past)").first();
  out.dayPicked = await day.innerText();
  await day.click();
  await page.waitForTimeout(500);
  await page.locator(".time-slot").first().click();
  await page.waitForTimeout(500);
  out.dateSummary = (await page.locator("text=Selection Summary").locator("..").innerText()).replace(/\n+/g, " | ");

  await page.getByRole("button", { name: /Continue to Choose Stylist/ }).click();
  await page.waitForSelector('h1:has-text("Stylist")', { timeout: 20000 });
  await page.waitForTimeout(700);

  await page.locator(".card").first().click();
  await page.waitForTimeout(400);
  await page.getByRole("button", { name: /Continue/ }).first().click();
  await page.waitForSelector("text=Your Details", { timeout: 20000 });
  await page.waitForTimeout(700);

  const body = await page.locator("body").innerText();
  out.detailsTypeLines = (body.match(/Gel Manicure[^\n]*/g) || []).slice(0, 3);
  out.detailsPrices = (body.match(/₱\d+/g) || []).slice(0, 8);

  const inputs = page.locator("input");
  const n = await inputs.count();
  for (let i = 0; i < n; i++) {
    const ph = (await inputs.nth(i).getAttribute("placeholder")) || "";
    if (/name/i.test(ph)) await inputs.nth(i).fill("Maria Santos");
    if (/phone/i.test(ph)) await inputs.nth(i).fill("09171234567");
  }
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: /Confirm/i }).first().click();
  await page.waitForTimeout(2500);

  out.confirmHeading = await page.locator("h1").first().innerText().catch(() => "ERR");
  out.confirmBody = (await page.locator("body").innerText()).replace(/\n+/g, " | ").slice(0, 700);
  out.saved = await page.evaluate(() => localStorage.getItem("salon_bookings"));

  return out;
}