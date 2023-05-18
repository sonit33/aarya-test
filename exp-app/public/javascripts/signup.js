$(document).ready(function () {
  console.log("page loaded");

  $("#login-form").submit(async function (e) {
    e.preventDefault();
    const formData = $(e.target).serializeArray();
    console.log(formData);
    if (await formValidator(validators)) {
      $.post("/signup", formData)
        .done(function (data) {
          console.log(data);
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
          warning: "Letters, spaces, dashes, and dots",
        },
        {
          evaluate: (t) => {
            return t.length > 2;
          },
          warning: "Too short",
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
          warning: "Letters, spaces, dashes, and dots",
        },
        {
          evaluate: (t) => {
            return t.length > 2;
          },
          warning: "Too short",
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
          warning: "Too short",
        },
        {
          evaluate: (t) => {
            return t.length < 20;
          },
          warning: "Too long",
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
          warning: "Too short",
        },
        {
          evaluate: (t) => {
            return t.length < 20;
          },
          warning: "Too long",
        },
      ],
    },
  };
});
