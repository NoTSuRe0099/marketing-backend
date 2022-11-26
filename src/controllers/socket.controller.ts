import { asyncError } from '../middleware/errorMiddleware';
import socketsSchema from '../model/sockets.schema';

const socketController = {
  createOrUpdateUserSocketId: async (userId: string, socketId: string) => {
    try {
      const exists = await socketsSchema.findOne({ userId });

      if (exists) {
        const result = await socketsSchema?.findOneAndUpdate({ userId }, {
          socketId
        }).catch((err) => {
          console.log('updating socketID err', err);
        });
        return result;
      }

      const result = await socketsSchema?.create({ userId }, {
        userId,
        socketId
      }).catch((err) => {
        console.log('updating socketID err', err);
      });
      return result;
    } catch (error) {
      console.log('updating socketID err', error);
    }
  },

  findSocketIdByUserId: async (userId: string) => {
    const user = await socketsSchema?.findOne({ userId });
    return user?.socketId;
  }

};

export default socketController;
