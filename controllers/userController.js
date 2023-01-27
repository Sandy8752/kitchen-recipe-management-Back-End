const { userDetails } = require("../models/user");
const { hashPassword, hashCompare, createToken } = require("../helpers/auth");
const sendEmail = require("../helpers/SendEmail");

const userController = {
  signup: async (req, res) => {
    try {
      // get Info
      const { userName, email, password } = req.body;

      // validations
      if (!userName || !email || !password)
        return res.json({
          statusCode: 400,
          message: "Please fill all fields.",
        });

      // check User
      let user = await userDetails.findOne({ email: email });
      if (user) {
        res.json({
          statusCode: 400,
          message: "User already exists",
        });
      } else {
        let hashed = await hashPassword(password);
        user = await userDetails.create({
          userName,
          email,
          password: hashed,
        });

        res.json({
          statusCode: 200,
          message: "Welcome! Registration Successful.",
          user,
        });
      }
    } catch (error) {
      res.json({
        statusCode: 500,
        message: "Internal Server Error",
        error,
      });
    }
  },

  signin: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await userDetails.findOne({ email });
      if (!user) {
        return res.json({
          statusCode: 400,
          message: "Not Registered",
        });
      }
      const isPasswordMatch = await hashCompare(password, user.password);
      if (!isPasswordMatch) {
        return res.json({
          statusCode: 400,
          message: "Check your credentials",
        });
      }

      const sessionToken = createToken.session({
        id: user._id,
        name: user.userName,
      });

      // refresh Token
      // const refresh_token = createToken.refresh({ id: user._id });
      // res.cookie("_apprefreshtoken", REFRESH_KEY, {
      //   httpOnly: true,
      //   path: "/auth/access",
      //   maxAge: 24 * 60 * 60 * 1000,
      // });

      res.json({
        statusCode: 200,
        message: "SignIn Success",
        sessionToken,
        user: {
          id: user._id,
          email: user.email,
          userName: user.userName,
        },
      });
    } catch (error) {
      res.json({
        statusCode: 500,
        message: "Internal Server Error",
        error,
      });
    }
  },

  forgot: async (req, res) => {
    try {
      const { email } = req.body;

      const user = await userDetails.findOne({ email: email });
      if (!user)
        return res.json({
          statusCode: 400,
          message: "Check your email",
        });

      // create access token
      const accessToken = createToken.access({
        id: user.id,
        email: user.email,
      });
      // console.log(accessToken);

      const url = `http://localhost:3000/reset_password/${accessToken}`;
      const name = user.userName;
      sendEmail.sendEmailReset(email, url, "Reset your Password", name);

      res.json({
        statusCode: 200,
        message: "Password reset link sent! please check your mail",
        accessToken,
      });
    } catch (error) {
      res.json({
        statusCode: 500,
        message: error.message,
      });
    }
  },

  reset: async (req, res) => {
    try {
      let accessToken = req.headers.authorization;
      const { password } = req.body;

      const newHashed = await hashPassword(password);

      const dbUser = await userDetails.findOne({ _id: req.user.id });
      const passwordCompare = await hashCompare(password, dbUser.password);

      if (accessToken) {
        if (password === "") {
          res.json({
            statusCode: 400,
            message: "Password Required",
          });
        } else if (!passwordCompare) {
          await userDetails.findOneAndUpdate(
            { _id: req.user.id },
            { $set: { password: newHashed } }
          );

          res.json({
            statusCode: 200,
            message: "Password reset successfully",
          });
        } else {
          res.json({
            statusCode: 400,
            message: "New Password should be different from old password",
          });
        }
      } else {
        res.json({
          statusCode: 400,
          message: "Invalid Token",
        });
      }
    } catch (error) {
      res.json({
        statusCode: 500,
        message: "Internal Server Error",
        error,
      });
    }
  },

  details: async (req, res) => {
    const { id } = req.user;
    const user = await userDetails.findOne({ _id: id });

    if (String(user._id) === id) {
      res.send({
        statusCode: 200,
        user,
      });
    } else {
      res.send({
        statusCode: 400,
        message: "ID not found",
      });
    }
  },

  updateProfile: async (req, res) => {
    const { id } = req.user;
    const { userName } = req.body;
    const user = await userDetails.findById({ _id: id });

    if (String(user._id) === id) {
      if (userName !== "") {
        const userUpdate = await userDetails.findOneAndUpdate(
          { _id: id },
          {
            $set: {
              userName: userName,
            },
          }
        );
        res.send({
          statusCode: 200,
          message: "Profile Updated",
          userUpdate,
        });
      } else {
        res.send({
          statusCode: 400,
          message: "Please Fill the respective field",
        });
      }
    } else {
      res.send({
        statusCode: 400,
        message: "ID not found",
      });
    }
  },
};

module.exports = userController;