$(function () {
  console.log("page loaded");

  $("#signup-form").on("submit", async function (e) {
    e.preventDefault();
    const formData = $(e.target).serializeArray();
    if (await formValidator(validators)) {
      $.post("/signup", formData)
        .done(function (data) {
          console.log("after signup: ", data);
          const { userId, newUser, isVerified } = data;
          if (newUser && !isVerified) {
            location.href = `/verification/${userId}`;
          } else if (!newUser && !isVerified) {
            location.href = `/verification/${userId}`;
          } else if (!newUser && isVerified) {
            console.log("login page");
          } else {
            console.log("login page");
          }
        })
        .fail(function (err) {
          console.log(err);
        });
    }
  });

  const validators = {
    email: sharedValidators.email,
    firstName: {
      valueSelector: "#firstName",
      warningSelector: "#firstName-warning",
      conditions: [
        {
          evaluate: (t) => {
            return /^[a-zA-Z\s\.]+$/.test(t);
          },
          warning: "Letters only",
        },
        {
          evaluate: (t) => {
            return t.length > 2;
          },
          warning: "Needs at least two letters",
        },
        {
          evaluate: (t) => {
            return t.length < 255;
          },
          warning: "Too long",
        },
      ],
    },
    lastName: {
      valueSelector: "#lastName",
      warningSelector: "#lastName-warning",
      conditions: [
        {
          evaluate: (t) => {
            return /^[a-zA-Z\s\.]+$/.test(t);
          },
          warning: "Letters only",
        },
        {
          evaluate: (t) => {
            return t.length > 2;
          },
          warning: "Needs at least two letters",
        },
        {
          evaluate: (t) => {
            return t.length < 255;
          },
          warning: "Too long",
        },
      ],
    },
    password: sharedValidators.password,
    confirmPassword: {
      valueSelector: "#confirmPassword",
      warningSelector: "#confirmPassword-warning",
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
        {
          evaluate: (t) => {
            return t == $("#password").val();
          },
          warning: "The two passwords must match",
        },
      ],
    },
  };

  applyKeyups(validators);
});
