// Verifies: registered full name + phone auto-fill the Reservation Details
// "CUSTOMER INFORMATION" fields.
export default async function run(page, ui) {
  const out = {};

  // 1. Register a new account (this is what stores the profile)
  await page.getByText("Sign Up").click();
  await page.waitForTimeout(400);
  await page.getByPlaceholder("Enter your name").fill("Maria Santos");
  await page.getByPlaceholder("Enter your phone").fill("09171234567");
  await page.getByPlaceholder("Enter your email").fill("maria@example.com");
  await page.getByPlaceholder("Enter your username").fill("maria");
  await page.getByPlaceholder("Enter your password").fill("password123");
  await page.getByPlaceholder("Re-enter your password").fill("password123");
  await page.getByRole("button", { name: "SIGN UP" }).click();
  await page.waitForTimeout(800);
  out.registered = await page.locator("body").innerText().then(t => /Account Created/.test(t));

  // 2. Log in with the registered account
  await page.getByRole("button", { name: "LOG IN NOW" }).click();
  await page.waitForTimeout(400);
  await page.getByPlaceholder("Enter your email").fill("maria@example.com");
  await page.getByPlaceholder("Enter your password").fill("password123");
  await page.getByRole("button", { name: "LOG IN" }).click();
  await page.waitForSelector("text=Welcome", { timeout: 20000 });
  await page.waitForTimeout(600);

  // 3. Walk the booking flow through to the Reservation Details step
  await page.getByRole("button", { name: /Book Now/ }).first().click();
  await page.waitForSelector('h1:has-text("Select Services")', { timeout: 20000 });
  await page.waitForTimeout(600);
  await page.getByRole("button", { name: "Book Now" }).first().click();
  await page.waitForTimeout(600);
  await page.getByRole("button", { name: /Continue/ }).first().click();
  await page.waitForSelector('h1:has-text("Select Date")', { timeout: 20000 });
  await page.waitForTimeout(600);

  const day = page.locator(".cal-day:not(.empty):not(.past)").first();
  await day.click();
  await page.waitForTimeout(400);
  await page.locator(".time-slot").first().click();
  await page.waitForTimeout(400);
  await page.getByRole("button", { name: /Continue to Choose Stylist/ }).click();
  await page.waitForSelector('h1:has-text("Stylist")', { timeout: 20000 });
  await page.waitForTimeout(600);
  await page.locator(".card").first().click();
  await page.waitForTimeout(400);
  await page.getByRole("button", { name: /Continue/ }).first().click();
  await page.waitForSelector("text=CUSTOMER INFORMATION", { timeout: 20000 });
  await page.waitForTimeout(800);

  // 4. Read back the two fields — these must NOT be empty
  out.fullNameValue = await page.getByPlaceholder("Your full name").inputValue();
  out.phoneValue = await page.getByPlaceholder("Your phone number").inputValue();

  // 5. The Confirm button is disabled unless both fields carry a value
  out.confirmDisabled = await page
    .getByRole("button", { name: /Confirm Booking/ })
    .isDisabled();

  return out;
}