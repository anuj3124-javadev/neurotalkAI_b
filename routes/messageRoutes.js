const express = require('express');
const { sendMessage } = require('../controllers/messageController');
const authenticate = require('../middleware/authMiddleware');
const router = express.Router({ mergeParams: true }); // to access chatId from parent

router.use(authenticate);

router.post('/', sendMessage);

module.exports = router;