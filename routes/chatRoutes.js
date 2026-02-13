const express = require('express');
const { getUserChats, createChat, getChatById, deleteChat } = require('../controllers/chatController');
const authenticate = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authenticate); // All chat routes require authentication

router.get('/', getUserChats);
router.post('/', createChat);
router.get('/:id', getChatById);
router.delete('/:id', deleteChat);

module.exports = router;