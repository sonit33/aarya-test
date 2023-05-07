function convertFormToJSON(form: any) {
  return $(form)
    .serializeArray()
    .reduce(function (json: any, { name, value }) {
      json[name] = value;
      return json;
    }, {});
}

$("#login-form").on("submit", function (e) {
  e.preventDefault();
  const form = $(e.target);
  const json = convertFormToJSON(form);
  console.log(json);
});
