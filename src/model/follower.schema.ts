import mongoose from 'mongoose';

const followerSchema = new mongoose.Schema({
  userId: {
    required: [true, 'userID is required*'],
    unique: true,
    ref: 'User',
    type: mongoose.Types.ObjectId,
  },
  followers: { required: false, type: [mongoose.Types.ObjectId] },
  following: { required: false, type: [mongoose.Types.ObjectId] },
});

export default mongoose.model('follower', followerSchema);
