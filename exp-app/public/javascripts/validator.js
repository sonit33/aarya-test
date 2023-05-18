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
