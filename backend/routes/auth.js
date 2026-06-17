const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authorize } = require('../middleware/auth');

router.post('/login', authController.login);
router.post('/register', authorize(['HEAD_ADMIN']), authController.register);
router.get('/profile', authorize(), authController.getProfile);
router.get('/workers', authorize(['HEAD_ADMIN', 'ADMIN']), authController.getWorkers);
router.post('/change-password', authorize(), authController.changePassword);

module.exports = router;
