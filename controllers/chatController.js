const pool = require('../config/db');
const generateTitle = require('../utils/generateTitle');

// @desc    Get all chats for authenticated user
// @route   GET /api/chats
const getUserChats = async (req, res) => {
    try {
        const [chats] = await pool.query(
            'SELECT id, title, created_at FROM chats WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(chats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create a new chat
// @route   POST /api/chats
const createChat = async (req, res) => {
    const { title } = req.body; // optional title, if not provided use placeholder

    try {
        const [result] = await pool.query(
            'INSERT INTO chats (user_id, title) VALUES (?, ?)',
            [req.user.id, title || 'New Chat']
        );
        const [newChat] = await pool.query('SELECT id, title, created_at FROM chats WHERE id = ?', [result.insertId]);
        res.status(201).json(newChat[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get a single chat with its messages
// @route   GET /api/chats/:id
const getChatById = async (req, res) => {
    const chatId = req.params.id;

    try {
        // Verify chat belongs to user
        const [chats] = await pool.query('SELECT * FROM chats WHERE id = ? AND user_id = ?', [chatId, req.user.id]);
        if (chats.length === 0) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        const [messages] = await pool.query(
            'SELECT role, content, created_at FROM messages WHERE chat_id = ? ORDER BY created_at ASC',
            [chatId]
        );

        res.json({ chat: chats[0], messages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete a chat
// @route   DELETE /api/chats/:id
const deleteChat = async (req, res) => {
    const chatId = req.params.id;

    try {
        const [result] = await pool.query('DELETE FROM chats WHERE id = ? AND user_id = ?', [chatId, req.user.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Chat not found' });
        }
        res.json({ message: 'Chat deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getUserChats, createChat, getChatById, deleteChat };