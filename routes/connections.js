const express = require('express');
const router = express.Router();
const controller = require('../controllers/connections');

module.exports = router;

router
  .route('/tickets')
  .post(
    controller.createSSOTicket
  )
	.delete(
		// TODO: Should be logged in for this one.
		controller.validateTicketURL,
		controller.revokeSSOTicketByURL
	);

router
  .route('/tickets/:ticket_id')
	.delete(
		// TODO: Should be logged in for this one.
		controller.revokeSSOTicketByID
	);

router
  .route('/:connection_id')
	.delete(
		// TODO: Should be logged in for this one.
		controller.deleteConnection
	)