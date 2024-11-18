const router = require("express").Router();
const registerValidation = require("../validation").registerValidation;
const loginValidation = require("../validation").loginValidation;
const User = require("../models/user-model");
const jwt = require("jsonwebtoken");
//console.log進入確認
router.use((req, res, next) => {
  console.log("正在接收auth route的請求");
  next();
});
//test
router.get("/testAPI", (req, res) => {
  return res.send("成功連結auth route");
});
//route，註冊
//joi的schema驗證請求，後續先看email...
router.post("/register", async (req, res) => {
  let { error } = registerValidation(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) {
    return res.status(400).send("此信箱已經被註冊");
  }
  let { username, email, password, role } = req.body;
  try {
    let createdUser = await User.create({ username, email, password, role });
    return res.send({
      msg: "成功儲存使用者",
      createdUser,
    });
  } catch (e) {
    return res.status(500).send("哎呀!伺服器出錯啦!唉唉唉唉唉呀!");
  }
});
//route，登入
//joi先驗證->檢查信箱有無->檢查密碼正確與否
router.post("/login", async (req, res) => {
  //joi的schema驗證請求
  let { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  let foundUser = await User.findOne({ email: req.body.email });
  if (!foundUser) return res.status(401).send("信箱不存在");
  //使用mongoose schema的instance method，傳入callback func
  foundUser.comparePassword(req.body.password, (e, isMatch) => {
    //try...catch..
    if (e) return res.status(500).send(e);
    //是否密碼正確
    if (isMatch) {
      //製作jwt
      const tokenObject = { _id: foundUser._id, email: foundUser.email };
      const token = jwt.sign(tokenObject, process.env.PASSPORT_SECRET);
      return res.send({
        message: "成功登入",
        token: "JWT " + token,
        user: foundUser,
      });
    } else {
      return res.status(400).send("密碼錯誤");
    }
  });
});

module.exports = router;
