const express = require("express");
const { config } = require("dotenv");
const bodyParser = require('body-parser');
const ErrorMiddleware = require("./middlewares/Error.js");
const cookieParser = require("cookie-parser");
const cors = require("cors");

config({
  path: "./.env",
});

const app = express();

//using middleware
const corsOptions = {
  origin: ["http://localhost:3000", "https://careerpro-six.vercel.app"],
  optionsSuccessStatus: 200, 
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());

//Importing routes
const userRoute = require("./routes/userRoute");
const careerRoute = require("./routes/careerRoute");
app.use("/api/v1/auth", userRoute);
app.use("/api/v1/career", careerRoute);

app.get("/", (req, res) => {
  res.send("CareerPro server is now live.");
});

app.use(ErrorMiddleware);
module.exports = app;
