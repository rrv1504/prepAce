const express = require("express");
const cors = require("cors");
const path = require("path");

const executeRoute = require("./routes/executeRoute");
const { startAutoCleanup } = require("./utils/cleanupService");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
startAutoCleanup();

app.use("/", executeRoute);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
