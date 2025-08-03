const express = require('express');
const router = express.Router();
const controller = require('../controllers/front');

module.exports = router;

// render the Vue App
router
  .route('/')
  .get(
    controller.home
  );

router
  .route('/login')
  .get(
    controller.login
  );
