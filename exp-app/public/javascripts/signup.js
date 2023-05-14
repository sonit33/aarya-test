$(document).ready(function () {
  console.log("page loaded");

  $("#login-form").submit(function (e) {
    e.preventDefault();
    const formData = $(e.target).serializeArray();
    console.log(formData);
    $.post("/signup", formData)
      .done(function (data) {
        console.log(data);
      })
      .fail(function (err) {
        console.log(err);
      });
  });
});
