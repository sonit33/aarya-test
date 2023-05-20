$(function () {
  console.log("page loaded");

  $("#verification-form").on("submit", async function (e) {
    e.preventDefault();
    const formData = $(e.target).serializeArray();
    if (await formValidator(validators)) {
      $.post("/verification", formData)
        .done(function (result) {
          location.href = result.next;
        })
        .fail(async function () {
          await alert_error("Incorrect verification code", "Check your email and try again");
        });
    }
  });

  const validators = {
    code: {
      valueSelector: "#code",
      warningSelector: "#code-warning",
      conditions: [
        {
          evaluate: (v) => {
            return v.length == 6;
          },
          warning: "Needs a six digital numerical code",
        },
      ],
    },
  };

  applyKeyups(validators);
});
