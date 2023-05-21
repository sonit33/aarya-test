const sharedValidators = {
  email: {
    valueSelector: "#email",
    warningSelector: "#email-warning",
    conditions: [
      {
        evaluate: (v) => {
          return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        warning: "Use standard email format e.g. abc@xyz.com",
      },
    ],
  },
  password: {
    valueSelector: "#password",
    warningSelector: "#password-warning",
    conditions: [
      {
        evaluate: (t) => {
          return t.length > 6;
        },
        warning: "Needs at least six digits and letters",
      },
      {
        evaluate: (t) => {
          return t.length < 25;
        },
        warning: "Too long",
      },
      {
        evaluate: (t) => {
          return /.*\d/.test(t);
        },
        warning: "Needs at least one digit",
      },
      {
        evaluate: (t) => {
          return /.*[a-zA-Z]/.test(t);
        },
        warning: "Needs at least one letter",
      },
    ],
  },
};

async function formValidator(validators) {
  const keys = Object.keys(validators);
  let invalidCounter = 0;
  for (let i = 0; i < keys.length; i++) {
    const v = validators[keys[i]];
    const isValid = await fieldValidator(v);
    if (!isValid) invalidCounter++;
  }
  return invalidCounter == 0;
}

function applyKeyups(validators) {
  const keys = Object.keys(validators);
  for (let i = 0; i < keys.length; i++) {
    const v = validators[keys[i]];
    $(v.valueSelector).on("keyup", async function () {
      await fieldValidator(validators[v.valueSelector.substring(1, v.valueSelector.length)]);
    });
  }
}

async function fieldValidator(validator) {
  return new Promise((resolve) => {
    const warn = $(validator.warningSelector);
    const val = $(validator.valueSelector).val();
    for (let i = 0; i < validator.conditions.length; i++) {
      const condition = validator.conditions[i];
      const isValid = condition.evaluate(val);
      warn.css("display", isValid ? "none" : "inline-block");
      warn.text(isValid ? "" : condition.warning);
      if (!isValid) return resolve(false);
    }
    return resolve(true);
  });
}
