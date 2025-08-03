const express = require('express');
const router = express.Router();
const controller = require('../controllers/api');

module.exports = router;

// render the Vue App
router
  .route('/')
  .get(
    controller.heartbeat
  );

