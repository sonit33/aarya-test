$(function () {
  $("#login-form").on("submit", async function (e) {
    e.preventDefault();
    const formData = $(e.target).serializeArray();
    if (await formValidator(validators)) {
      $.post("/login", formData)
        .done(function (data) {
          location.href = data.next;
        })
        .fail(async function (err) {
          await alert_error("Login failed", err.responseJSON.message);
        });
    }
  });

  const validators = {
    email: sharedValidators.email,
    password: sharedValidators.password,
  };

  applyKeyups(validators);
});
