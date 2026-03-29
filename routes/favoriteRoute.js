const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const favoriteController = require("../controllers/favoriteController")

// View all saved vehicles (login required)
router.get("/", utilities.checkLogin, utilities.handleErrors(favoriteController.buildFavorites))

// Add a vehicle to favorites (login required)
router.post("/add", utilities.checkLogin, utilities.handleErrors(favoriteController.addFavorite))

// Remove a vehicle from favorites (login required)
router.post("/remove", utilities.checkLogin, utilities.handleErrors(favoriteController.removeFavorite))

module.exports = router
