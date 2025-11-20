import {
  autoAssignTask,
  createTask,
  deleteTask,
  listTasks,
  updateTask,
} from './task.service.js';

export const listTasksHandler = async (req, res, next) => {
  try {
    const filters = req.query;
    const tasks = await listTasks({ ownerId: req.user.userId, filters });
    return res.json(tasks);
  } catch (error) {
    return next(error);
  }
};

export const createTaskHandler = async (req, res, next) => {
  try {
    const { body } = req.validated;
    const data = await createTask({ ownerId: req.user.userId, data: body });
    return res.status(201).json(data);
  } catch (error) {
    return next(error);
  }
};

export const updateTaskHandler = async (req, res, next) => {
  try {
    const { params, body } = req.validated;
    const data = await updateTask({
      ownerId: req.user.userId,
      taskId: params.taskId,
      updates: body,
    });
    return res.json(data);
  } catch (error) {
    return next(error);
  }
};

export const deleteTaskHandler = async (req, res, next) => {
  try {
    const task = await deleteTask({
      ownerId: req.user.userId,
      taskId: req.params.taskId,
    });
    return res.json(task);
  } catch (error) {
    return next(error);
  }
};

export const autoAssignHandler = async (req, res, next) => {
  try {
    const { body } = req.validated;
    const member = await autoAssignTask({ ownerId: req.user.userId, projectId: body.projectId });
    return res.json(member);
  } catch (error) {
    return next(error);
  }
};



