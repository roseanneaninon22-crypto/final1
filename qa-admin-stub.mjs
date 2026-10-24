// QA: stub the Supabase auth/table calls, then screenshot the admin dashboard
// charts (default view + each filter) and the Services / Service Items lists.
const bookings = [
  { id: "b1", customer_name: "Ana Cruz", customer_phone: "0917", services: "Hair Cut, Manicure", stylist: "Christine Rory", date: fakeDate(0), time: "10:00 AM", status: "completed", total: 500, notes: "" },
  { id: "b2", customer_name: "Ben Reyes", customer_phone: "0918", services: "Hair Spa", stylist: "Monica Vargas", date: fakeDate(0), time: "1:00 PM", status: "pending", total: 480, notes: "" },
  { id: "b3", customer_name: "Cai Lim", customer_phone: "0919", services: "Facial", stylist: "Elisa Coppenger", date: fakeDate(-3), time: "2:00 PM", status: "confirmed", total: 550, notes: "" },
  { id: "b4", customer_name: "Dan Go", customer_phone: "0920", services: "Hair Color", stylist: "Christine Rory", date: fakeDate(-9), time: "11:00 AM", status: "completed", total: 1200, notes: "" },
  { id: "b5", customer_name: "Eve Tan", customer_phone: "0921", services: "Makeup", stylist: "Monica Vargas", date: fakeDate(-20), time: "3:00 PM", status: "cancelled", total: 0, notes: "" },
  { id: "b6", customer_name: "Fay Yu", customer_phone: "0922", services: "Waxing", stylist: "Elisa Coppenger", date: fakeDate(-45), time: "9:00 AM", status: "completed", total: 650, notes: "" },
  { id: "b7", customer_name: "Gia Ong", customer_phone: "0923", services: "Manicure", stylist: "Christine Rory", date: fakeDate(-70), time: "4:00 PM", status: "completed", total: 290, notes: "" },
  { id: "b8", customer_name: "Hugo Diaz", customer_phone: "0924", services: "Hair Cut", stylist: "Monica Vargas", date: fakeDate(-110), time: "10:30 AM", status: "completed", total: 350, notes: "" },
];

function fakeDate(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function stubScript() {
  const list = window.__QA_BOOKINGS__;
  const respond = (data) => Promise.resolve({ data, error: null, count: data ? data.length : 0 });
  const rowsFor = (name) => name === "bookings"
    ? list
    : name === "users"
      ? [{ id: "u1", full_name: "Ana Cruz", email: "a@x.com", phone: "0917", role: "user", created_at: new Date().toISOString() }]
      : [];
  const table = (name) => {
    const rows = rowsFor(name);
    const q = {};
    ["select", "order", "eq", "neq", "limit", "insert", "update", "delete"].forEach(m => { q[m] = () => q; });
    q.maybeSingle = () => respond(null);
    q.single = () => respond(null);
    q.then = (resolve, reject) => respond(rows).then(resolve, reject);
    return q;
  };
  const session = { user: { id: "admin-1", email: "admin@qa.local", user_metadata: { full_name: "QA Admin" } } };
  const auth = {
    getSession: () => Promise.resolve({ data: { session } }),
    getUser: () => Promise.resolve({ data: { user: session.user }, error: null }),
    refreshSession: () => Promise.resolve({ data: { session }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } }),
    signOut: () => Promise.resolve({ error: null }),
  };
  window.supabase = {
    createClient: () => ({
      auth,
      from: table,
      channel: () => ({ on() { return this; }, subscribe() { return this; } }),
      removeChannel: () => Promise.resolve(),
      storage: { from: () => ({ upload: () => respond({}), getPublicUrl: () => ({ data: { publicUrl: "" } }) },
    })},
  };
}

export default async function run(page) {
  await page.addInitScript(`window.__QA_BOOKINGS__ = ${JSON.stringify(bookings)}; (${stubScript.toString()})();`);
  await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".admin-chart-grid", { timeout: 60000 });
  await page.waitForTimeout(1200);

  const out = {};
  const snap = () => page.evaluate(() => ({
    bars: [...document.querySelectorAll(".admin-bar-col")].map(c => ({
      label: c.querySelector(".admin-bar-label")?.textContent,
      value: c.querySelector(".admin-bar-value")?.textContent,
      revenue: c.querySelector(".admin-bar-revenue")?.textContent,
      height: c.querySelector(".admin-bar-fill")?.style.height,
    })),
    donut: [...document.querySelectorAll(".admin-donut circle")].filter(c => c.getAttribute("stroke-dasharray")).map(c => c.getAttribute("stroke-dasharray")),
    donutTotal: document.querySelector(".admin-donut-total")?.textContent,
    legend: [...document.querySelectorAll(".admin-legend-list li")].map(li => li.innerText.replace(/\s+/g, ")),
    pills: [...document.querySelectorAll(".admin-panel-pill")].map(p => p.textContent),
  }));

  out.sixMonths = await snap();
  await page.screenshot({ path: "C:/Users/Jerry/OneDrive/Desktop/Salon/qa-charts-6m.png", fullPage: true });

  await page.getByRole("button", { name: "30 days" }).click();
  await page.waitForTimeout(400);
  out.thirtyDays = await snap();

  await page.getByRole("button", { name: "7 days" }).click();
  await page.waitForTimeout(400);
  out.sevenDays = await snap();
  await page.screenshot({ path: "C:/Users/Jerry/OneDrive/Desktop/Salon/qa-charts-7d.png", fullPage: true });

  // Services: click a category, expect its items as a list.
  await page.getByRole("button", { name: /Nails/ }).first().click();
  await page.waitForTimeout(600);
  out.servicesNails = await page.evaluate(() => ({
    rows: [...document.querySelectorAll(".admin-svc-row")].map(r => r.innerText.replace(/\s+/g, ")),
  }));
  await page.screenshot({ path: "C:/Users/Jerry/OneDrive/Desktop/Salon/qa-services-list.png", fullPage: true });
  return out;
}
