const express = require('express');
const router = express.Router();
const multer = require('multer');
const requestController = require('../controllers/requestController');
const { authorize } = require('../middleware/auth');

const upload = multer({ dest: 'uploads/' });

router.get('/', authorize(), requestController.getRequests);
router.get('/:id', authorize(), requestController.getRequest);
router.post('/', authorize(['HEAD_ADMIN', 'ADMIN', 'WORKER', 'TENANT']), requestController.createRequest);
router.patch('/:id/status', authorize(['HEAD_ADMIN', 'ADMIN', 'WORKER']), requestController.updateRequestStatus);
router.patch('/:id/assign', authorize(['HEAD_ADMIN', 'ADMIN']), requestController.assignRequest);
router.delete('/:id', authorize(['HEAD_ADMIN', 'ADMIN']), requestController.deleteRequest);
router.post('/:id/photos', authorize(), upload.single('photo'), requestController.uploadPhoto);

module.exports = router;
