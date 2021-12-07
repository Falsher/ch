const { Forbidden } = require("http-errors");

const userModel = require("./model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { SECRET_KEY } = process.env;

const { validationResult } = require("express-validator");

class authControl {
  async signup(req, res) {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ message: "ошибка при регистрации", error });
    }
    try {
      const { name, password } = req.body;

      const candidate = await userModel.findOne({ name });

      if (!candidate) {
        const hashPass = bcrypt.hashSync(password, bcrypt.genSaltSync(6));
        const usersZero = await userModel.find().limit(1);

        const user = await userModel.create({
          name,
          role: !usersZero.length ? "ADMIN" : "USER",
          password: hashPass,
        });

        const payload = {
          name,
          role: user.role,
          ban: user.ban,
          mute: user.mute,
          id: user._id.toString(),
          online: user.online,
          color: user.color,
        };

        const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "8h" });

        return res.json({ token, message: "registration" });
      }

      const isCorrectPassword = await bcrypt.compare(
        password,
        candidate.password
      );

      if (!isCorrectPassword) {
        throw new Forbidden("You errror password");
      }

      const payload = {
        name,
        online: candidate.online,
        role: candidate.role,
        ban: candidate.ban,
        mute: candidate.mute,
        id: candidate._id.toString(),
        color: candidate.color,
      };

      // await userModel.findByIdAndUpdate(candidate._id);
      const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "8h" });

      return res.json({ token, message: "registration" });
    } catch (error) {
      console.error(error);
      res.status(400).send("ошибка регистрации");
    }
  }

  async getusers(req, res) {
    try {
      const users = await userModel.find({}, "name color role ban mute online");

      return res.json(users);
    } catch (error) {
      console.error(err.message);
    }
  }
}
module.exports = new authControl();
