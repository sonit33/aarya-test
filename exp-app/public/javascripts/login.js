$(document).ready(function () {
  console.log("page loaded");

  $("#login-form").submit(function (e) {
    e.preventDefault();
    const formData = $(e.target).serializeArray();
    $.post("/login", formData)
      .done(function (data) {
        console.log("after login: ", data);
      })
      .fail(function (err) {
        console.log(err);
      });
  });
});
