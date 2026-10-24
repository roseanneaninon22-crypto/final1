const fs = require("fs");
const C = String.fromCharCode(125);
const path = "qa-admin-stub.mjs";
const lines = fs.readFileSync(path, "utf8").split("\n");

const fixed = {
  37: '  const session = { user: { id: "admin-1", email: "admin@qa.local", user_metadata: { full_name: "QA Admin" } ' + C + ' };',
  42: '    onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} ' + C + ' }),',
  51: '      storage: { ' + 'from: () => ({ upload: () => respond({}), getPublicUrl: () => ({ data: { publicUrl: "" ' + C + ' }) ' + C + ',',
  52: '    })' + C + ',',
};

Object.entries(fixed).forEach(([num, text]) => {
  const idx = Number(num) - 1;
  console.log("before:", JSON.stringify(lines[idx]));
  lines[idx] = text;
});

fs.writeFileSync(path, lines.join("\n"));
console.log("--- after ---");
lines.slice(34, 56).forEach((l, i) => console.log(35 + i, l));
