const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors({origin: true}));

const {acousticBrainzProxy} = require("./callableFunctions/acousticBrainzProxy")
;
const {myFunction} = require("./callableFunctions/myFunction");
exports.acousticBrainzProxy = acousticBrainzProxy;
exports.myFunction = myFunction;
