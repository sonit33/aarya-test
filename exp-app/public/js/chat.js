$(function () {
  $("#chat-form").submit(async function (e) {
    e.preventDefault();
    const messageEl = $(`<p class="text-gray-800"></p>`);
    const responseEl = $(`<p class="text-gray-600"></p>`);
    const container = $(`<div class=""/>`);
    const messageInput = $("#message");
    container.append(messageEl).append(responseEl);
    $(".chat-log").append(container);
    messageEl.text(messageInput.val());
    const opts = {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        _csrf: $("#_csrf").val(),
        message: messageInput.val(),
      }),
    };
    messageInput.val("");
    const chunkedResponse = await fetch("/chat/stream", opts);
    if (chunkedResponse.status == 200) {
      const reader = chunkedResponse.body.getReader();
      const decoder = new TextDecoder("utf-8");
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        const chunk = decoder.decode(value);
        responseEl.append(chunk);
      }
    }
  });
});
