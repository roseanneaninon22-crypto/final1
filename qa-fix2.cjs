const fs = require("fs");
const C = String.fromCharCode(125);
const path = "qa-admin-stub.mjs";
const lines = fs.readFileSync(path, "utf8").split("\n");

lines[36] = '  const session = { user: { id: "admin-1", email: "admin@qa.local", user_metadata: { full_name: "QA Admin" ' + C + ' + C + ' }; ';
lines[41] = '    onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} ' + C + ' + C + ' }), ';
lines[50] = '      storage: { from: () => ({ upload: () => respond({}), getPublicUrl: () => ({ data: { publicUrl: "" ' + C + ' }) ' + C + ' + C + ', ';

fs.writeFileSync(path, lines.join("\n"));
console.log(lines.slice(36, 53).join("\n"));
