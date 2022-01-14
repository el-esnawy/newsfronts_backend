const http = require("node-request-promise");
const assert = require("assert");
const HTMLParser = require("node-html-parser");

async function getHTML() {
  const httpsRes = await http.get("https://www.bbc.com/news/stories-58089029");
  const HTMLparsed = HTMLParser.parse(httpsRes, {
    lowerCaseTagName: false,
    comment: false,
    blockTextElements: {
      script: false,
      noscript: true,
      style: true,
      pre: true,
    },
  });

  const img = Object.keys(HTMLparsed.childNodes[0]);

  console.log(img);
}

getHTML();
