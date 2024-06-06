const express = require("express");
const { config } = require("dotenv");
const ErrorMiddleware = require("./middlewares/Error.js");
const cookieParser = require("cookie-parser");
const cors = require("cors");

config({
  path: "./config/config.env",
});

const app = express();

//using middleware
const corsOptions = {
  origin: ["http://localhost:3000"],
  optionsSuccessStatus: 200, 
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());

//Importing routes
const userRoute = require("./routes/userRoute");
app.use("/api/v1/auth", userRoute);

app.get("/", (req, res) => {
  res.send("CareerPro server is now live.");
});

app.use(ErrorMiddleware);
module.exports = app;
