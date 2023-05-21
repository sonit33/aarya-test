async function alert_info(title, sub) {
  await alert_template(title, sub, "bg-blue-100 my-8 rounded-b text-blue-900 px-4 py-3 shadow-md");
}

async function alert_warning(title, sub) {
  await alert_template(
    title,
    sub,
    "alert bg-orange-100 my-8 rounded-b text-orange-900 px-4 py-3 shadow-md"
  );
}

async function alert_success(title, sub) {
  await alert_template(
    title,
    sub,
    "alert bg-green-100 my-8 rounded-b text-green-900 px-4 py-3 shadow-md"
  );
}

async function alert_error(title, sub) {
  await alert_template(
    title,
    sub,
    "alert bg-red-100 my-8 rounded-b text-red-900 px-4 py-3 shadow-md"
  );
}

async function alert_hide() {
  await alert_template(null, null, "alert hidden");
}

async function alert_template(title, sub, style) {
  return new Promise((resolve) => {
    $("#alert").removeAttr("class");
    $("#alert").attr("class", style);
    $(".alert .title").text(title);
    $(".alert .sub").text(sub);
    resolve();
  });
}
