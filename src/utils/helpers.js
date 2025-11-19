export const buildPagination = ({ page = 1, limit = 20 }) => {
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const safePage = Math.max(Number(page) || 1, 1);
  return {
    limit: safeLimit,
    offset: (safePage - 1) * safeLimit,
  };
};

export const formatActivityMessage = ({ taskTitle, fromMember, toMember }) =>
  `Task "${taskTitle}" reassigned from ${fromMember} to ${toMember}.`;

export const createHttpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

