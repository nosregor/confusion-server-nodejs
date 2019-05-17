const express = require("express");
const cors = require("cors");

const app = express();

// list of origins the server will accept
const whitelist = ["http://localhost:3000", "https://localhost:3443"];

const corsOptionsDelegate = (req, callback) => {
  let corsOptions; //

  console.log(req.header("Origin"));

  // if the incomming request header contains an Origin field:
  // is it present in the whitelist?
  if (whitelist.indexOf(req.header("Origin")) !== -1) {
    corsOptions = { origin: true }; // Access-Control-Allow-Origin & include it to the header (Access-Control-Allow-Header)
  } else {
    corsOptions = { origin: false };
  }
  callback(null, corsOptions);
};

// cors w/o any options: CORS-enabled for all origins!
// Access-Control-Allow-Origin header "*" wild card
exports.cors = cors();

// CORS-enabled for a whitelisted domain
exports.corsWithOptions = cors(corsOptionsDelegate);
