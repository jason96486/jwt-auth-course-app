const passport = require("passport");

let JwtStrategy = require("passport-jwt").Strategy;
let ExtractJwt = require("passport-jwt").ExtractJwt;
const User = require("../models").User;
//
module.exports = (passport) => {
  let opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("jwt"),
    secretOrKey: process.env.PASSPORT_SECRET,
  };

  passport.use(
    new JwtStrategy(opts, async function (jwt_payload, done) {
      //從客戶端給的jwt解密後，取得id 用id用mongoose抓資料 存到req.user
      let foundUser = await User.findOne({ _id: jwt_payload._id }).exec();
      try {
        if (foundUser) {
          //存到req.user裡去
          return done(null, foundUser);
        } else {
          return done(null, false);
        }
      } catch (e) {
        return done(e, false);
      }
    })
  );
};
