'use strict'

const form = document.getElementById('editInventoryForm')
const submitBtn = form.querySelector('button[type="submit"]')

// Capture a snapshot of all form values on load
const originalData = new FormData(form)
const originalValues = new URLSearchParams(originalData).toString()

// Disable submit until something changes
submitBtn.disabled = true

form.addEventListener('input', function () {
  const currentData = new FormData(form)
  const currentValues = new URLSearchParams(currentData).toString()
  submitBtn.disabled = currentValues === originalValues
})
