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

  res.render("./inventory/details", {
    title,
    nav,
    details,
  });
});

/* ***************************
 *  Build inventory management view
 * ************************** */
invCont.buildMgmtView = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    errors: null,
  })
}

/* ***************************
 *  Build add-classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
  })
}

/* ***************************
 *  Process add classification
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  const { classification_name } = req.body
  const result = await invModel.addClassification(classification_name)
  let nav = await utilities.getNav()
  if (result.rowCount) {
    req.flash("notice", `Classification "${classification_name}" added successfully.`)
    res.status(201).render("inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, adding the classification failed.")
    res.status(501).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
      classification_name,
    })
  }
}

/* ***************************
 *  Build add-inventory view
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()
  res.render("inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    classificationList,
    errors: null,
  })
}

/* ***************************
 *  Process add inventory
 * ************************** */
invCont.addInventory = async function (req, res, next) {
  const {
    inv_make, inv_model, inv_year, inv_description,
    inv_image, inv_thumbnail, inv_price, inv_miles,
    inv_color, classification_id,
  } = req.body
  const result = await invModel.addInventory(
    inv_make, inv_model, inv_year, inv_description,
    inv_image, inv_thumbnail, inv_price, inv_miles,
    inv_color, classification_id
  )
  let nav = await utilities.getNav()
  if (result.rowCount) {
    req.flash("notice", `${inv_year} ${inv_make} ${inv_model} added successfully.`)
    res.status(201).render("inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null,
    })
  } else {
    const classificationList = await utilities.buildClassificationList(classification_id)
    req.flash("notice", "Sorry, adding the vehicle failed.")
    res.status(501).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors: null,
      inv_make, inv_model, inv_year, inv_description,
      inv_image, inv_thumbnail, inv_price, inv_miles,
      inv_color, classification_id,
    })
  }
}

module.exports = invCont;