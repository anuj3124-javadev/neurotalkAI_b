const pool = require('../config/db');
const { getMistralResponse } = require('../services/mistralService');
const generateTitle = require('../utils/generateTitle');

// @desc    Send a message in a chat and get AI response
// @route   POST /api/messages/:chatId
const sendMessage = async (req, res) => {
    const chatId = req.params.chatId;
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ message: 'Message content required' });
    }

    try {
        // Verify chat belongs to user
        const [chats] = await pool.query('SELECT * FROM chats WHERE id = ? AND user_id = ?', [chatId, req.user.id]);
        if (chats.length === 0) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        const chat = chats[0];

        // Save user message
        await pool.query(
            'INSERT INTO messages (chat_id, role, content) VALUES (?, ?, ?)',
            [chatId, 'user', content]
        );

        // If this is the first message, update chat title
        const [msgCount] = await pool.query('SELECT COUNT(*) as count FROM messages WHERE chat_id = ?', [chatId]);
        if (msgCount[0].count === 1) {
            const title = generateTitle(content);
            await pool.query('UPDATE chats SET title = ? WHERE id = ?', [title, chatId]);
        }

        // Fetch all messages in this chat for context
        const [messages] = await pool.query(
            'SELECT role, content FROM messages WHERE chat_id = ? ORDER BY created_at ASC',
            [chatId]
        );

        // Prepare messages for Mistral API
        const mistralMessages = messages.map(m => ({ role: m.role, content: m.content }));

        // Get AI response
        let aiResponse;
        try {
            aiResponse = await getMistralResponse(mistralMessages);
        } catch (error) {
            // If Mistral fails, still return user message saved but indicate error
            return res.status(503).json({ message: 'AI service unavailable', userMessage: content });
        }

        // Save AI response
        await pool.query(
            'INSERT INTO messages (chat_id, role, content) VALUES (?, ?, ?)',
            [chatId, 'assistant', aiResponse]
        );

        // Return both messages
        res.json({
            userMessage: { role: 'user', content },
            assistantMessage: { role: 'assistant', content: aiResponse }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { sendMessage };