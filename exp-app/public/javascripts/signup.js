$(document).ready(function () {
  console.log("page loaded");

  $("#login-form").submit(async function (e) {
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

  $("#email").on("keyup", async function () {
    await fieldValidator(validators["email"]);
  });

  $("#firstName").on("keyup", async function () {
    await fieldValidator(validators["firstName"]);
  });

  $("#lastName").on("keyup", async function () {
    await fieldValidator(validators["lastName"]);
  });

  $("#password").on("keyup", async function () {
    await fieldValidator(validators["password"]);
  });

  $("#confirmPassword").on("keyup", async function () {
    await fieldValidator(validators["confirmPassword"]);
  });

  const validators = {
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
});
