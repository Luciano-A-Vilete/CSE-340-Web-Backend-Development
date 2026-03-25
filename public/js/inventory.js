'use strict'

// Listen for classification select changes
const classificationList = document.querySelector('#classificationList')
classificationList.addEventListener('change', function () {
  const classification_id = classificationList.value
  const classURL = '/inv/getInventory/' + classification_id
  fetch(classURL)
    .then(response => {
      if (response.ok) return response.json()
      throw new Error('Network response was not OK')
    })
    .then(data => {
      console.log(data)
      buildInventoryList(data)
    })
    .catch(err => {
      console.error('There was a problem: ', err.message)
    })
})

// Build the inventory table rows and inject into the DOM
function buildInventoryList(data) {
  let inventoryDisplay = document.getElementById('inventoryDisplay')
  let dataTable = '<thead><tr><th>Vehicle Name</th><td>&nbsp;</td><td>&nbsp;</td></tr></thead>'
  dataTable += '<tbody>'
  data.forEach(item => {
    dataTable += `<tr><td>${item.inv_make} ${item.inv_model}</td>`
    dataTable += `<td><a href='/inv/edit/${item.inv_id}' title='Click to update'>Modify</a></td>`
    dataTable += `<td><a href='/inv/delete/${item.inv_id}' title='Click to delete'>Delete</a></td></tr>`
  })
  dataTable += '</tbody>'
  inventoryDisplay.innerHTML = dataTable
}
