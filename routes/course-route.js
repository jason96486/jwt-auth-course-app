const router = require("express").Router();
const Course = require("../models").Course;
const courseValidation = require("../validation").courseValidation;
//console.log進入確認，進來這個router要有jwt token
router.use((req, res, next) => {
  console.log("course正在接收request");
  next();
});
//route，取得所有課程資料
router.get("/", async (req, res) => {
  //populate可以關聯出其他資料
  try {
    let courseFound = await Course.find({})
      .populate("instructor", ["username", "email"])
      .exec();
    return res.send(courseFound);
  } catch (e) {
    return res.status(500).send("伺服器錯誤");
  }
});
//route，用講師id找課程
router.get("/instructor/:_instructor_id", async (req, res) => {
  let { _instructor_id } = req.params;
  let courseFound = await Course.find({ instructor: _instructor_id })
    .populate("instructor", ["username", "email"])
    .exec();
  return res.send(courseFound);
});
//route,用學生id找註冊過的課程
router.get("/student/:_student_id", async (req, res) => {
  let { _student_id } = req.params;
  let courseFound = await Course.find({ students: _student_id })
    .populate("instructor", ["username", "email"])
    .exec();
  return res.send(courseFound);
});
//route，用課程名稱找課程
router.get("/findByName/:name", async (req, res) => {
  let { name } = req.params;
  try {
    let courseFound = await Course.find({ title: name })
      .populate("instructor", ["username", "email"])
      .exec();
    return res.send(courseFound);
  } catch (e) {
    return res.status(500).send(e);
  }
});

//route,用course的_id取得某筆課程資料
router.get("/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    let courseFound = await Course.findOne({ _id })
      .populate("instructor", ["email"])
      .exec();
    return res.send(courseFound);
  } catch (e) {
    return res.status(500).send(e);
  }
});
//route，patch request，以course的_id更新某筆課程，以jwt token跟資料請求，需登入 需跟課程開設講師相符
router.patch("/:_id", async (req, res) => {
  let { _id } = req.params;
  //joi驗證更新課程的資料是否正確
  let { error } = courseValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  try {
    //有無符合_id的課程
    let courseFound = await Course.findOne({ _id });
    if (!courseFound) return res.status(400).send("課程不存在");
    //課程_id跟登入的講師_id是否相符
    if (courseFound.instructor.equals(req.user._id)) {
      let updatedCourse = await Course.findOneAndUpdate({ _id }, req.body, {
        new: true,
        runValidators: true,
      });
      return res.send({
        message: "課程更新成功",
        updatedCourse,
      });
    } else {
      return res.status(403).send("只有該課程講師能更新");
    }
  } catch (e) {
    return res.status(500).send(e);
  }
});

//route，delete request，結構同上面的patch request
router.delete("/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    //有無符合_id的課程
    let courseFound = await Course.findOne({ _id });
    if (!courseFound) return res.status(400).send("課程不存在");
    //課程_id跟登入的講師_id是否相符
    if (courseFound.instructor.equals(req.user._id)) {
      await Course.deleteOne({ _id }).exec();
      return res.send("課程已被刪除");
    } else {
      return res.status(403).send("只有該課程講師能刪除");
    }
  } catch (e) {
    return res.status(500).send(e);
  }
});
//route，學生透過課程id註冊新課程
router.post("/enroll/:_id", async (req, res) => {
  let { _id } = req.params; //課程_id
  try {
    let course = await Course.findOne({ _id }).exec();
    course.students.push(req.user._id); //登入的使用者_id
    await course.save();
    return res.send("課程註冊成功");
  } catch (e) {
    return res.status(500).send(e);
  }
});

//route，header放jwt token，body放數據請求新增
//joi驗證->schema instance method判斷身分->Course schema建檔 其中instructor屬性為user schema中的_id屬性
router.post("/", async (req, res) => {
  //joi
  let { error } = courseValidation(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  //是不是講師身分
  if (req.user.isStudent()) {
    return res.status(400).send("只有老師能發佈新課程");
  }
  let { title, description, price } = req.body;
  //客戶端有jwt才能進來，伺服器在passport步驟 以從jwt解密的id去mongoose抓資料存到req.user中
  try {
    let savedCourse = await Course.create({
      title,
      description,
      price,
      instructor: req.user._id,
    });
    return res.send({
      message: "新課程已保存",
      savedCourse,
    });
  } catch (e) {
    return res.status(500).send("伺服器錯誤");
  }
});

module.exports = router;
