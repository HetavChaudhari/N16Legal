// Wraps async route handlers so rejected promises reach the
// global error handler instead of hanging the request (Express 4
// does not catch async errors by itself).
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
