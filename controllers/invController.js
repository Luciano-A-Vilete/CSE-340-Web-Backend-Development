const invModel = require("../models/inventory-model");
const favoriteModel = require("../models/favorite-model");
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

  let isFavorited = false
  if (res.locals.loggedin) {
    isFavorited = await favoriteModel.checkFavorite(res.locals.accountData.account_id, data[0].inv_id)
  }

  res.render("./inventory/details", {
    title,
    nav,
    details,
    inv_id: data[0].inv_id,
    isFavorited,
  });
});

/* ***************************
 *  Build inventory management view
 * ************************** */
invCont.buildMgmtView = async function (req, res, next) {
  let nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    classificationList,
    errors: null,
  })
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.buildEditInventory = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryByInventoryId(inv_id)
  const item = itemData[0]
  const classificationList = await utilities.buildClassificationList(item.classification_id)
  const name = `${item.inv_make} ${item.inv_model}`
  res.render("inventory/edit-inventory", {
    title: "Edit " + name,
    nav,
    classificationList,
    errors: null,
    inv_id: item.inv_id,
    inv_make: item.inv_make,
    inv_model: item.inv_model,
    inv_year: item.inv_year,
    inv_description: item.inv_description,
    inv_image: item.inv_image,
    inv_thumbnail: item.inv_thumbnail,
    inv_price: item.inv_price,
    inv_miles: item.inv_miles,
    inv_color: item.inv_color,
    classification_id: item.classification_id,
  })
}

/* ***************************
 *  Process inventory update
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  const {
    inv_id, inv_make, inv_model, inv_year, inv_description,
    inv_image, inv_thumbnail, inv_price, inv_miles,
    inv_color, classification_id,
  } = req.body
  const result = await invModel.updateInventory(
    inv_id, inv_make, inv_model, inv_year, inv_description,
    inv_image, inv_thumbnail, inv_price, inv_miles,
    inv_color, classification_id
  )
  let nav = await utilities.getNav()
  if (result) {
    req.flash("notice", `${inv_year} ${inv_make} ${inv_model} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationList = await utilities.buildClassificationList(classification_id)
    const name = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + name,
      nav,
      classificationList,
      errors: null,
      inv_id, inv_make, inv_model, inv_year, inv_description,
      inv_image, inv_thumbnail, inv_price, inv_miles,
      inv_color, classification_id,
    })
  }
}

/* ***************************
 *  Build delete confirmation view
 * ************************** */
invCont.buildDeleteConfirm = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryByInventoryId(inv_id)
  const item = itemData[0]
  const name = `${item.inv_make} ${item.inv_model}`
  res.render("inventory/delete-confirm", {
    title: "Delete " + name,
    nav,
    errors: null,
    inv_id: item.inv_id,
    inv_make: item.inv_make,
    inv_model: item.inv_model,
    inv_year: item.inv_year,
    inv_price: item.inv_price,
  })
}

/* ***************************
 *  Process inventory deletion
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  const inv_id = parseInt(req.body.inv_id)
  const result = await invModel.deleteInventoryItem(inv_id)
  if (result.rowCount) {
    req.flash("notice", "The vehicle was successfully deleted.")
    res.redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, the deletion failed.")
    res.redirect(`/inv/delete/${inv_id}`)
  }
}

/* ***************************
 *  Return inventory items as JSON for a given classification
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData && invData.length > 0) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
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