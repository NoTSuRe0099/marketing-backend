import mongoose from 'mongoose';

const ConnectDB = async () => {
  await mongoose
    .connect(`${process.env.MONGODB_URI}`)
    .then(() => console.log('DB Connected! ✅'))
    .catch((err) => {
      console.log(err);
    });
};

export default ConnectDB;
