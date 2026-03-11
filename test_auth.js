const http = require("http");

const options = {
  hostname: "localhost",
  port: 3000,
  path: "/api/auth/session",
  method: "GET",
  headers: {
    Accept: "application/json",
  },
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  res.setEncoding("utf8");
  let body = "";
  res.on("data", (chunk) => {
    body += chunk;
  });
  res.on("end", () => {
    console.log("BODY START");
    console.log(body.substring(0, 500));
    console.log("BODY END");
    if (body.startsWith("<!DOCTYPE")) {
      console.log(
        "\nDIAGNOSIS: The server is indeed returning HTML instead of JSON.",
      );
    }
  });
});

req.on("error", (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.end();
