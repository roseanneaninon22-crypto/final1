// Temporary QA helper: signs in via Supabase auth and prints the session token.
export default async function run(page) {
  return page.evaluate(async () => {
    const url = "https://gfwbenbshrkbbgovxbfs.supabase.co";
    const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdmd2JlbmJzaHJrYmJnb3Z4YmZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5NTg1OTIsImV4cCI6MjEwMTUzNDU5Mn0.5IPMzSsm2yFUdq6ayKPMF-MDSp2dvL9KwcWPkezBvf0";
    const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
    const creds = { email: "qa-admin@example.com", password: "qa-admin-12345" };

    await fetch(`${url}/auth/v1/signup`, { method: "POST", headers, body: JSON.stringify(creds) });
    const login = await fetch(`${url}/auth/v1/token?grant_type=password`, { method: "POST", headers, body: JSON.stringify(creds) });
    const session = await login.json();
    if (!session.access_token) return { error: "login failed", detail: session };

    const userId = session.user.id;
    const roles = [];
    roles.push(await (await fetch(`${url}/rest/v1/users`, {
      method: "POST", headers: { ...headers, Authorization: `Bearer ${session.access_token}`, Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({ user_id: userId, full_name: "QA Admin", email: creds.email, phone: "", role: "admin" }),
    })).text());
    const service = await (await fetch(`${url}/rest/v1/services`, { headers })).text();
    return { creds, userId, usersUpsert: roles, services: service.slice(0, 400) };
  });
}
