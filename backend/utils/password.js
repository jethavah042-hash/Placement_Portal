const STRONG_PW = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=]).{8,64}$/;

function isStrongPassword(pw) {
  return typeof pw === 'string' && STRONG_PW.test(pw);
}

function isValidEmail(email) {
  return typeof email === 'string' && /^[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}$/.test(email);
}

module.exports = { isStrongPassword, isValidEmail };
