const Router = require("express");
const router = new Router();
const controller = require("./authControl");

const { check } = require("express-validator");
router.post(
  "/signup",
  [
    check("name", "имя пользователя не может быть пустым")
      .notEmpty()
      .isLength({
        max: 10,
        min: 3,
      })
      .matches(/^[A-Za-zА-Яа-я]+$/),
    check("password", "не более 10 символов").isLength({ min: 3, max: 10 }),
  ],
  controller.signup
);

router.get("/users", controller.getusers);
module.exports = router;
