export const validateRequest = (schema) => async (req, res, next) => {
  try {
    const parsed = await schema.parseAsync({
      body: req.body,
      params: req.params,
      query: req.query,
    });
    req.validated = parsed;
    return next();
  } catch (error) {
    return res.status(400).json({
      message: 'Validation failed',
      issues: error.errors ?? [],
    });
  }
};



