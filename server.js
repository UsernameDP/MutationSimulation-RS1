const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const corsOptions = require("./Config/corsOptions");
const connectDB = require("./Middleware/connectToDB");
require("dotenv").config();
const PORT = 3500;

mongoose.set("strictQuery", true);
connectDB();

app.use(cors(corsOptions));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.headers.origin}\t${req.method}\t${req.url}`);
  next();
});

app.use(express.static(path.join(__dirname, "Public")));

app.use("/", require("./Routes/root"));
app.use("/data", require("./Routes/API/data"));

app.all("*", (req, res) => {
  if (req.accepts("html")) {
    res.status(404);
    res.sendFile(path.join(__dirname, "Views", "404.html"));
  }
});

mongoose.connection.once("open", () => {
  console.log(`Connected to DataBase`);
  app.listen(PORT, () => {
    console.log(`App listening on Port ${PORT}`);
  });
});
