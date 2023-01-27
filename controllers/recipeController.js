var { RecipeDetails } = require("../models/recipe");
var mongodb = require("mongodb");

const recipeController = {
  postRecipe: async (req, res) => {
    try {
      const recipeData = req.body;
      const userId = req.user.id;
      const userName = req.user.name;
      if (userId) {
        const addRecipe = new RecipeDetails({
          ...recipeData,
          userId,
          userName,
        });
        await addRecipe.save();
        res.json({
          statusCode: 200,
          addRecipe,
        });
      } else {
        res.json({ statusCode: 404, status: "404 Not Found" });
      }
    } catch (error) {
      res.json({
        statusCode: 500,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },

  getRecipes: async (req, res) => {
    try {
      const recipes = await RecipeDetails.find({});
      res.json({
        statusCode: 200,
        recipes,
      });
    } catch (error) {
      res.json({
        statusCode: 500,
        message: error.message,
      });
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const recipe = await RecipeDetails.findOne({ _id: id });
      if (String(recipe._id) === id) {
        res.json({
          statusCode: 200,
          recipe,
        });
      } else {
        res.json({
          statusCode: 400,
          message: "Recipe not found",
        });
      }
    } catch (error) {
      res.json({
        statusCode: 500,
        message: error.message,
      });
    }
  },

  updateRecipe: async (req, res) => {
    try {
      const { id } = req.params;
      const { recipeName, description, instructions, ingredients, image } =
        req.body;
      const userRecipe = await RecipeDetails.findOne({ userId: req.user.id });

      if (req.user.id && userRecipe) {
        const recipeData = await RecipeDetails.findOneAndUpdate(
          { _id: id },
          {
            $set: {
              recipeName: recipeName,
              description: description,
              instructions: instructions,
              ingredients: ingredients,
              image: image,
            },
          }
        );

        res.json({
          statusCode: 200,
          message: "Recipe updated",
          recipeData,
        });
      } else {
        res.json({
          statusCode: 400,
          message: "Not authorized",
        });
      }
    } catch (error) {
      res.json({
        statusCode: 500,
        message: error.message,
      });
    }
  },

  deleteRecipe: async (req, res) => {
    try {
      // console.log(req.user.id);
      const { id } = req.params;
      const recipe = await RecipeDetails.findOne({ _id: id });
      const userRecipe = await RecipeDetails.findOne({ userId: req.user.id });
      if (req.user.id && userRecipe) {
        if (recipe) {
          const recipeData = await RecipeDetails.deleteOne({ _id: id });
          res.json({
            statusCode: 200,
            message: "Recipe Deleted",
            recipeData,
          });
        } else {
          res.json({
            statusCode: 400,
            message: "Recipe not found",
          });
        }
      } else {
        res.json({
          statusCode: 400,
          message: "Not authorized",
        });
      }
    } catch (error) {
      res.json({
        statusCode: 500,
        message: error.message,
      });
    }
  },

  favRecipe: async (req, res) => {
    try {
      const userId = req.user.id;
      const recipe = await RecipeDetails.findOne({
        _id: mongodb.ObjectId(req.body.id),
      });

      const liked = recipe.likes.findIndex((id) => id === String(userId));

      if (recipe) {
        if (liked === -1) {
          recipe.likes.push(userId);
        } else {
          recipe.likes = recipe.likes.filter((id) => id !== String(userId));
        }
        await RecipeDetails.findByIdAndUpdate(
          { _id: mongodb.ObjectId(req.body.id) },
          recipe
        );

        let message = "";

        if (liked !== -1) {
          message = "Fav Removed";
        } else {
          message = "Favorite";
        }
        res.json({
          statusCode: 200,
          message,
        });
      } else {
        res.send({
          statusCode: 400,
          message: "Recipe Not Found",
        });
      }
    } catch (error) {
      res.json({
        statusCode: 500,
        message: error.message,
      });
    }
  },

  addComment: async (req, res) => {
    try {
      const { id } = req.user;
      const { name } = req.user;

      const recipe = await RecipeDetails.findOne({ _id: req.params.id });
      // console.log(recipe);

      if (String(recipe._id) === req.params.id) {
        let push = await RecipeDetails.findOneAndUpdate(
          { _id: req.params.id },
          {
            $push: {
              comments: {
                userId: id,
                userName: name,
                comment: req.body.comment,
                commentedAt: Date.now(),
              },
            },
          }
        );
        // console.log(push);
        res.send({
          statusCode: 200,
          message: "Comment added successfully!",
        });
      } else {
        res.send({
          statusCode: 400,
          message: "Recipe not found",
        });
      }
    } catch (error) {
      res.send({
        statusCode: 500,
        error,
      });
    }
  },

  getFavRecipe: async (req, res) => {
    try {
      const userId = req.user.id;
      const fav = await RecipeDetails.find({ likes: userId });

      if (fav.length > 0) {
        res.send({
          statusCode: 200,
          fav,
        });
      } else {
        res.send({
          statusCode: 400,
          message: "No Recipes Found",
        });
      }
    } catch (error) {
      res.send({
        statusCode: 500,
        error: error.message,
      });
    }
  },
};

module.exports = recipeController;