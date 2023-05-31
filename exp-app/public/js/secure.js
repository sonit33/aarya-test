$(function () {
  $.get("/secure")
    .done((data) => {
      console.log(data);
    })
    .fail((err) => {
      if (err.status == 401) location.href = "/login";
    });
});
