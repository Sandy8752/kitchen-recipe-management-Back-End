var express = require("express");
var router = express.Router();
var userController = require("../controllers/userController");
var auth = require("../Middleware/auth");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Welcome to Kitchen Recipe Management" });
});

router.post("/signup", userController.signup);
router.post("/signin", userController.signin);
router.post("/forgot_password", userController.forgot);
router.post("/reset_password", auth.access, userController.reset);
router.get("/profile", auth.session, userController.details);
router.put("/updateProfile", auth.session, userController.updateProfile);

module.exports = router;