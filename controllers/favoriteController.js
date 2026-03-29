const utilities = require("../utilities/")
const favoriteModel = require("../models/favorite-model")

/* ****************************************
 * Display all saved vehicles for the logged-in user
 * GET /fav/
 **************************************** */
async function buildFavorites(req, res, next) {
  const account_id = res.locals.accountData.account_id
  let nav = await utilities.getNav()
  const favorites = await favoriteModel.getFavoritesByAccount(account_id)
  res.render("favorites/list", {
    title: "My Favorites",
    nav,
    favorites,
    errors: null,
  })
}

/* ****************************************
 * Add a vehicle to favorites
 * POST /fav/add
 **************************************** */
async function addFavorite(req, res, next) {
  const account_id = res.locals.accountData.account_id
  const inv_id = parseInt(req.body.inv_id)
  const result = await favoriteModel.addFavorite(account_id, inv_id)
  if (result && result.rowCount !== undefined) {
    req.flash("notice", "Vehicle added to your favorites!")
  } else {
    req.flash("notice", "Could not add to favorites. Please try again.")
  }
  res.redirect(`/inv/detail/${inv_id}`)
}

/* ****************************************
 * Remove a vehicle from favorites
 * POST /fav/remove
 **************************************** */
async function removeFavorite(req, res, next) {
  const account_id = res.locals.accountData.account_id
  const inv_id = parseInt(req.body.inv_id)
  const redirectTo = req.body.redirect_to || `/inv/detail/${inv_id}`
  const result = await favoriteModel.removeFavorite(account_id, inv_id)
  if (result && result.rowCount > 0) {
    req.flash("notice", "Vehicle removed from your favorites.")
  } else {
    req.flash("notice", "Could not remove from favorites. Please try again.")
  }
  res.redirect(redirectTo)
}

module.exports = { buildFavorites, addFavorite, removeFavorite }
