import { getUserProfile, loginUser, registerUser } from './auth.service.js';

export const register = async (req, res, next) => {
  try {
    const { body } = req.validated;
    const data = await registerUser(body);
    return res.status(201).json(data);
  } catch (error) {
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { body } = req.validated;
    const data = await loginUser(body);
    return res.json(data);
  } catch (error) {
    return next(error);
  }
};

export const me = async (req, res, next) => {
  try {
    const user = await getUserProfile({ userId: req.user.userId });
    return res.json({ user });
  } catch (error) {
    return next(error);
  }
};

