const express = require('express');
const router = express.Router();
const controller = require('../controllers/organizations');

module.exports = router;

router
  .route('/')
	.get(
    controller.getOrganizations
  )

router
  .route('/:organization_id')
  .get(
    controller.getOrganizationById
  )