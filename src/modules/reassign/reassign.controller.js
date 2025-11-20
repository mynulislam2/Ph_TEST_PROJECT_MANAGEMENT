import { reassignTasksService } from './reassign.service.js';

export const reassignTasksHandler = async (req, res, next) => {
  try {
    const result = await reassignTasksService({ ownerId: req.user.userId });
    return res.json(result);
  } catch (error) {
    return next(error);
  }
};



