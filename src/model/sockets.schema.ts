import mongoose from 'mongoose';

const socketSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Types.ObjectId,
    required: true,
    unique: true,
    ref: 'users'
  },

  socketId: {
    type: String,
    required: true,
    unique: true
  },

});

export default mongoose.model('socket', socketSchema);
