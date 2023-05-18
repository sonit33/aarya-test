var passwordValidDefinition = [
  {
    minLength: 6,
    ErrorMessage: "Your password needs at least six digits and letters",
  },
  {
    maxLength: 25,
    ErrorMessage: "Your password cannot be longer than 25 characters.",
  },
  {
    regex: /.*\d/,
    ErrorMessage: "Your password must contain at least one digit.",
  },
  {
    regex: /.*[a-zA-Z]/,
    ErrorMessage: "Your password must contain at least one letter.",
  },
];

module.exports = function validatePasswordString(
  password,
  passwordValidators = passwordValidDefinition
) {
  var errors = [];

  passwordValidators.forEach((v) => {
    var valid = true;

    if (v.hasOwnProperty("regex")) {
      if (password.search(v.regex) < 0) valid = false;
    }

    if (v.hasOwnProperty("minLength")) {
      if (password.length < v.minLength) valid = false;
    }

    if (v.hasOwnProperty("maxLength")) {
      if (password.length > v.maxLength) valid = false;
    }

    if (!valid) errors.push(v.ErrorMessage);
  });

  return errors;
};
