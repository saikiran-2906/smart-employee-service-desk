const userRepository = require('../repositories/userRepository');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// Resolves the calling user from the X-User-Id header sent by the frontend's
// identity picker. This app has no password-based login (documented design
// decision), so authorization is based on the claimed identity rather than a
// signed session token. It still enforces real server-side rules (a user
// cannot view/act on tickets outside their role's scope by tampering with
// query params), it just does not cryptographically verify "who you are".
const requireCurrentUser = asyncHandler(async (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId || !Number.isInteger(Number(userId))) {
    throw ApiError.unauthorized('Missing or invalid X-User-Id header.');
  }
  const user = await userRepository.findById(Number(userId));
  if (!user) {
    throw ApiError.unauthorized('Unknown user.');
  }
  req.currentUser = user;
  next();
});

module.exports = requireCurrentUser;
