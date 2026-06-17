const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.post('/requests', publicController.submitPublicRequest);

module.exports = router;
