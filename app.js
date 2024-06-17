const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
require("dotenv").config({path: `../.env.${process.env.NODE_ENV}`});
const routes = require("./routes/routes.js");
const cors = require("cors");
const envPathFile = process.env.npm_config_Path_File || "./config";
const config = require(envPathFile + "/configuration.json")[
    process.env.NODE_ENV || "dev"
];
const port = process.env.BACKEND_PORT; 
const sequelize = require("./utils/dbConn");
const https = require('https');
const { default: axios } = require("axios");

//Insert Seed : Do comment after inserted
const seed = require("./utils/seed");

if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'local' ) {
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    })
    axios.defaults.httpsAgent = httpsAgent
    // eslint-disable-next-line no-console
    console.log(process.env.NODE_ENV, `RejectUnauthorized is disabled.`)
  }

// DB connection
// const MONGODB_URL = config.MONGODB_URL;
// const mongoose = require("mongoose");
// mongoose.connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
// 	//don't show the log when it is test
// 	if (process.env.NODE_ENV !== "test") {
// 		console.log("Connected to %s", MONGODB_URL);
// 		console.log("App is running ... \n");
// 		console.log("Press CTRL + C to stop the process. \n");
// 	}
// })
// 	.catch(err => {
// 		console.error("App starting error:", err.message);
// 		process.exit(1);
// 	});

// var db = mongoose.connection;

var app = express();
app.disable("x-powered-by");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//To allow cross-origin requests

app.use(cors());
//Cors sonarqube security hotspot fix suggestion
// let corsOptions = {
//     origin: 'trustedwebsite.com' // Compliant
//   };

//Route Prefixes
app.use("/", routes);



// throw 404 if URL not found
app.all("*", function (req, res) {
    return res.status(404).json({ data: "Page not found" });
    // return apiResponse.notFoundResponse(res, "Page not found");
});

app.use((err, req, res) => {
    if (err.name == "UnauthorizedError") {
        return res.status(404).json({ err: err.message });
        //	return apiResponse.unauthorizedResponse(res, err.message);
    }
});

// app.listen(port, () => {
// 	console.log("App is listening on", port)
// })

sequelize
    .sync({
        force: true, // this will create the new table everytime it will get executed forcefully.
    })
    .then(() => {
        console.log("connected to DB!");
        app.listen(port, () => {
            console.log("App is listening on", port);
        });
    })
    .catch((err) => {
        console.log(err);
    });

module.exports = app;
