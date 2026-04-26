/**
 * Socket.IO Chat Module
 * Handles real-time communication for the community chat.
 */

const Message = require('../models/Message');

function configureSockets(io) {
  let onlineUsers = 0;

  io.on('connection', async (socket) => {
    onlineUsers++;
    
    // Broadcast when a user connects
    io.emit('user connect', { onlineCount: onlineUsers });
    console.log(`🔌 User connected. Online: ${onlineUsers}`);

    // Load recent history & pinned messages for this specific client
    try {
      // Get the 15 most recent normal messages
      const recentMessages = await Message.find({ isPinned: false })
        .sort({ createdAt: -1 })
        .limit(15)
        .lean();
      
      // Get all pinned messages
      const pinnedMessages = await Message.find({ isPinned: true })
        .sort({ createdAt: 1 })
        .lean();

      // Send to the newly connected client
      socket.emit('init chat', {
        recentMessages: recentMessages.reverse(),
        pinnedMessages: pinnedMessages
      });
    } catch (err) {
      console.error('Error loading chat history:', err);
    }

    // Listen for incoming chat messages
    socket.on('chat message', async (data) => {
      try {
        const newMsg = new Message({
          username: data.username || 'Guest',
          text: data.text
        });
        const savedMsg = await newMsg.save();

        const messagePayload = {
          _id: savedMsg._id,
          username: savedMsg.username,
          text: savedMsg.text,
          timestamp: savedMsg.createdAt,
          isPinned: savedMsg.isPinned
        };
        
        io.emit('chat message', messagePayload);
      } catch (err) {
        console.error('Error saving chat message:', err);
      }
    });

    // Listen for pin message event
    socket.on('pin message', async (messageId) => {
      try {
        const msg = await Message.findByIdAndUpdate(messageId, { isPinned: true }, { new: true });
        if (msg) io.emit('message pinned', msg);
      } catch (err) {
        console.error('Error pinning message:', err);
      }
    });

    // Listen for unpin message event
    socket.on('unpin message', async (messageId) => {
      try {
        const msg = await Message.findByIdAndUpdate(messageId, { isPinned: false }, { new: true });
        if (msg) io.emit('message unpinned', msg);
      } catch (err) {
        console.error('Error unpinning message:', err);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      onlineUsers--;
      io.emit('user disconnect', { onlineCount: onlineUsers });
      console.log(`🔌 User disconnected. Online: ${onlineUsers}`);
    });
  });
}

module.exports = configureSockets;
