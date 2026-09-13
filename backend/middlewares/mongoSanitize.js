function stripOperators(value) {
  if (Array.isArray(value)) return value.map(stripOperators);
  if (value && typeof value === 'object') {
    const clean = {};
    for (const [key, nested] of Object.entries(value)) {
      if (key.startsWith('$') || key.includes('.')) continue;
      clean[key] = stripOperators(nested);
    }
    return clean;
  }
  return value;
}

module.exports = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = stripOperators(req.body);
  }
  next();
};
