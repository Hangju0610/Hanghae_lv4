const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const cookirParser = require("cookie-parser");

const indexRouter = require("./routes");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(morgan("dev"));
app.use(express.json());
app.use(cookirParser());

app.use("/api", indexRouter);

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
