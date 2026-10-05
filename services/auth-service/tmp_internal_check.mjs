process.env.INTERNAL_API_KEY = "k".repeat(24);
const { requireInternalKey } = await import("./src/middleware/internal.js");

function run(headers) {
  return new Promise((resolve) => {
    const req = { headers };
    const res = {
      statusCode: 200,
      status(c) { this.statusCode = c; return this; },
      json(body) { resolve({ status: this.statusCode, body }); return this; },
    };
    requireInternalKey(req, res, () => resolve({ status: 200, next: true }));
  });
}

console.log("no key:  ", JSON.stringify(await run({})));
console.log("bad key: ", JSON.stringify(await run({ "x-internal-key": "nope" })));
console.log("good key:", JSON.stringify(await run({ "x-internal-key": process.env.INTERNAL_API_KEY })));