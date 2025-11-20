import {
  createProject,
  getProject,
  listProjects,
  updateProject,
} from './project.service.js';

export const createProjectHandler = async (req, res, next) => {
  try {
    const { body } = req.validated;
    const project = await createProject({ ownerId: req.user.userId, ...body });
    return res.status(201).json(project);
  } catch (error) {
    return next(error);
  }
};

export const listProjectsHandler = async (req, res, next) => {
  try {
    const projects = await listProjects({ ownerId: req.user.userId });
    return res.json(projects);
  } catch (error) {
    return next(error);
  }
};

export const getProjectHandler = async (req, res, next) => {
  try {
    const project = await getProject({
      projectId: req.params.projectId,
      ownerId: req.user.userId,
    });
    return res.json(project);
  } catch (error) {
    return next(error);
  }
};

export const updateProjectHandler = async (req, res, next) => {
  try {
    const { params, body } = req.validated;
    const project = await updateProject({
      projectId: params.projectId,
      ownerId: req.user.userId,
      updates: body,
    });
    return res.json(project);
  } catch (error) {
    return next(error);
  }
};



