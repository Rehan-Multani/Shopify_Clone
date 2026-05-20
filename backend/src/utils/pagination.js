export const getPagination = (req, defaults = { limit: 20, maxLimit: 100 }) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(
    Math.max(parseInt(req.query.limit) || defaults.limit, 1),
    defaults.maxLimit
  );
  return { page, limit, skip: (page - 1) * limit };
};

export const buildMeta = ({ page, limit, total }) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit) || 1,
});
