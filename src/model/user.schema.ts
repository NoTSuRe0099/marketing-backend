import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    required: [true, 'Role is Required*'],
    default: 'user',
    enum: ['admin', 'user'],
  },
  username: {
    type: String,
    required: [true, 'Username is Required*'],
    minlength: [4, 'Username must be at least 4 characters long'],
  },
  firstname: {
    type: String,
    required: [true, 'First name is Required*'],
  },
  lastname: {
    type: String,
    required: [true, 'Last name is Required*'],
  },
  email: {
    type: String,
    required: [true, 'Email is Required*'],
    unique: [true, 'Email Already Exists'],
  },
  password: {
    type: String,
    required: [true, 'Password is Required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false,
  },
  avatar: {
    type: String,
    required: false,
  },
  verified: {
    type: Boolean,
    default: false,
    required: true
  }

});

export default mongoose.model('User', userSchema);
