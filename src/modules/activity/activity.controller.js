import { listActivity } from './activity.service.js';

export const listActivityHandler = async (req, res, next) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const logs = await listActivity({ ownerId: req.user.userId, limit });
    return res.json(logs);
  } catch (error) {
    return next(error);
  }
};

