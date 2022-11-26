import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Types.ObjectId,
    required: true
  },

  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: false
  },

}, { timestamps: true });

export default mongoose.model('post', postSchema);
