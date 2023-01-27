var express = require("express");
var router = express.Router();
var auth = require("../Middleware/auth");
var recipeController = require("../controllers/recipeController");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/allRecipes", recipeController.getRecipes);
router.post("/addRecipe", auth.session, recipeController.postRecipe);
router.get("/recipe/:id", recipeController.getById);
router.put("/updateRecipe/:id", auth.session, recipeController.updateRecipe);
router.delete("/removeRecipe/:id", auth.session, recipeController.deleteRecipe);
router.patch("/favRecipe", auth.session, recipeController.favRecipe);
router.get("/favRecipes", auth.session, recipeController.getFavRecipe);
router.patch("/addComment/:id", auth.session, recipeController.addComment);

module.exports = router;