const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = utilities.handleErrors(async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
});

/* ***************************
 *  Build vehicle detail display
 * ************************** */
invCont.buildByInventoryId = utilities.handleErrors(async function (req, res, next) {
  const inventoryId = req.params.inventoryId;
  const data = await invModel.getInventoryByInventoryId(inventoryId);

  if (!data || data.length === 0) return next(new Error("Vehicle not found"));

  const details = await utilities.buildVehicleDetail(data[0]);
  let nav = await utilities.getNav();
  const title = `${data[0].inv_make} ${data[0].inv_model}`;

  res.render("./inventory/detail", {
    title,
    nav,
    details,
  });
});

module.exports = invCont;