const pool = require("../database/")

/* *****************************
 * Add a vehicle to favorites
 * *************************** */
async function addFavorite(account_id, inv_id) {
  try {
    const sql = `INSERT INTO favorites (account_id, inv_id)
                 VALUES ($1, $2)
                 ON CONFLICT (account_id, inv_id) DO NOTHING
                 RETURNING *`
    return await pool.query(sql, [account_id, inv_id])
  } catch (error) {
    return error.message
  }
}

/* *****************************
 * Remove a vehicle from favorites
 * *************************** */
async function removeFavorite(account_id, inv_id) {
  try {
    const sql = `DELETE FROM favorites WHERE account_id = $1 AND inv_id = $2 RETURNING *`
    return await pool.query(sql, [account_id, inv_id])
  } catch (error) {
    return error.message
  }
}

/* *****************************
 * Check if a vehicle is already favorited
 * *************************** */
async function checkFavorite(account_id, inv_id) {
  try {
    const sql = `SELECT favorite_id FROM favorites WHERE account_id = $1 AND inv_id = $2`
    const result = await pool.query(sql, [account_id, inv_id])
    return result.rowCount > 0
  } catch (error) {
    return false
  }
}

/* *****************************
 * Get all favorites for an account
 * with full vehicle details (JOIN with inventory)
 * TODO: Implement this function
 * *************************** */
async function getFavoritesByAccount(account_id) {
  try {
    const sql = `
      SELECT i.inv_id, i.inv_make, i.inv_model, i.inv_year,
             i.inv_thumbnail, i.inv_price, i.inv_color
      FROM favorites f
      JOIN inventory i ON f.inv_id = i.inv_id
      WHERE f.account_id = $1
      ORDER BY f.created_at DESC`
    const result = await pool.query(sql, [account_id])
    return result.rows
  } catch (error) {
    return error.message
  }
}

module.exports = { addFavorite, removeFavorite, checkFavorite, getFavoritesByAccount }
