const http = require("http");
const https = require("https");
const url = require("url");
const stringDecoder = require("string_decoder").StringDecoder;
const config = require("./config");
const fs = require("fs");
const stringify = require("./Utils").stringify;
const _data = require("./lib/data");

// Testing
_data.delete("tests", "new_file", (err) => {
  if (err) {
    console.log(`\nError: ${err}\n`);
  }
});

// Instantiating the HTTP server
const httpServer = http.createServer((req, res) => {
  unifiedServer(req, res);
});

httpServer.listen(config.httpPort, () => {
  console.log(
    `Server listening on port ${config.httpPort}\nRunning in ${config.envName} mode.`
  );
});

// Instantiae the HTTPS server
const httpsServerOptions = {
  key: fs.readFileSync("./key.pem"),
  cert: fs.readFileSync("./cert.pem"),
};
const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
  unifiedServer(req, res);
});

// Start the HTTPS server
httpsServer.listen(config.httpsPort, () => {
  console.log(
    `Server listening on port ${config.httpsPort}\nRunning in ${config.envName} mode.`
  );
});

// Define handlers
const handlers = {};

// Ping handler
handlers.ping = (data, callback) => {
  callback(200);
};

// Define not found handler
handlers.notFound = (data, callback) => {
  callback(404);
};

// Define a request router
const router = {
  ping: handlers.ping,
};

// All of the server logic for both the http and https server
const unifiedServer = (req, res) => {
  // Get the URL and parse it
  const parsedUrl = url.parse(req.url, true);

  // Geth the path
  const pathname = parsedUrl.pathname;
  const trimmedPath = pathname.replace(/^\/+|\/+$/g, "");

  // Get the Query string as an object
  const queryStringObject = stringify(parsedUrl.query);

  // Get the HTTP method
  const method = req.method.toLowerCase();

  // Get the headers as an object
  const headersObject = stringify(req.headers);

  // Get the payload, if any
  const decoder = new stringDecoder("utf-8");
  let buffer = "";

  cls();

  req.on("data", (data) => {
    buffer += decoder.write(data);
  });

  req.on("end", () => {
    buffer += decoder.end();

    // Choose the handler this request should go to. If one is not found, use the notFound handler.
    const chosenHandler =
      typeof router[trimmedPath] != "undefined"
        ? router[trimmedPath]
        : handlers.notFound;

    // Construct a data object to send to the handler
    const data = {
      trimmedPath: trimmedPath,
      queryStringObject: queryStringObject,
      method: method,
      headers: headersObject,
      payload: buffer,
    };

    // Route the request to the handler, specified by the router
    chosenHandler(data, (statusCode, payload) => {
      // User the status code called back by the handler or default to 200
      statusCode = typeof statusCode == "number" ? statusCode : 200;

      // Use the payload called back by the handler or default to an empty object
      payload = typeof payload == "object" ? payload : {};

      // Convert the payload to a string
      payloadString = stringify(payload);

      // Return the repsonse
      res.setHeader("Content-Type", "application/json");
      res.writeHead(statusCode);

      // Send response
      res.end(payloadString);

      console.log(
        `Sending back this response: ${statusCode}, ${payloadString}`
      );

      if (buffer) {
        console.log(
          `The request was received with this payload ${stringify(buffer)}`
        );
      }

      queryStringObject !== undefined
        ? console.log("Query string: " + queryStringObject + "\n")
        : null;

      headersObject !== undefined
        ? console.log("Headers: " + headersObject + "\n")
        : null;
    });

    console.log(
      `Request received on path ${trimmedPath}\nRequest method: ${method}`
    );
  });
};
