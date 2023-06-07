var express = require("express");
var router = express.Router();
// const mustAuth = require("../lib/middleware/mustAuth");

/* GET home page. */
router.get("/", function (req, res) {
  res.render("chat/index", { title: "Chat with Aarya" });
});

router.post("/stream", async function (req, res) {
  const { message } = req.body;
  const opts = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPEN_API_KEY}`,
    },
    method: "POST",
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
      stream: true,
      temperature: 0.4,
      max_tokens: 255,
    }),
  };
  // console.log(opts);
  const chunkedResponse = await fetch("https://api.openai.com/v1/chat/completions", opts);

  if (chunkedResponse.status == 200) {
    // Enable streaming response
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const reader = chunkedResponse.body.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      const chunk = decoder.decode(value);
      const lines = chunk.split(`\n`);
      const parsedLines = lines
        .map((line) => line.replace(/^data: /, "").trim()) // Remove the "data: " prefix
        .filter((line) => line !== "" && line !== "[DONE]") // Remove empty lines and "[DONE]"
        .map((line) => JSON.parse(line)); // Parse the JSON string

      for (const parsedLine of parsedLines) {
        const { choices } = parsedLine;
        const { delta } = choices[0];
        const { content } = delta;
        if (content) {
          res.write(content);
        }
      }
    }

    res.end();
  } else {
    res.status(chunkedResponse.status).send({ message: chunkedResponse.statusText });
  }
});

module.exports = router;
