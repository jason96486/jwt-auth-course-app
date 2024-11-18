const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const authRoute = require("./routes").auth;
const courseRoute = require("./routes").course;
//
const passport = require("passport");
require("./config/passport")(passport);
const cors = require("cors");
const path = require("path");
//若無環境變數，預設使用本地mongodb
mongoose
  .connect(process.env.MONGODB_CONNECTION || "mongodb://127.0.0.1:27017/mernDB")
  .then(() => {
    console.log("Connecting to mongodb...");
  })
  .catch((e) => {
    console.log(e);
  });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
//routes
app.use("/api/user", authRoute);
//courseRoute為被保護，如果request的header內沒有jwt則為unauthorized
app.use(
  "/api/courses",
  passport.authenticate("jwt", { session: false }),
  courseRoute
);
//提供build文件夾的靜態資源
app.use(express.static(path.join(__dirname, "client", "build")));
//前端route，或是說後端api以外的route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

//react預設是3000，express用8080區別，若無環境變數預設是8080
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`後端伺服器正在聆聽port${port}`);
});
