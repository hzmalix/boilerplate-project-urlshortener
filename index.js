require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dns = require("dns");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

let urls = [];
let nextId = 1;

app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.post("/api/shorturl", (req, res) => {
  const { url } = req.body;

  if (!url) {
    res.json({ error: "invalid url" });
    return;
  }

  const urlObj = new URL(url);

  dns.lookup(urlObj.hostname, (err) => {
    if (err) {
      res.json({ error: "invalid url" });
      return;
    }

    const id = nextId++;
    urls.push({ id, url });
    res.json({ original_url: url, short_url: id });
  });
});

app.get("/api/shorturl/:id", (req, res) => {
  const { id } = req.params;
  const urlObj = urls.find((u) => u.id == id);
  if (!urlObj) {
    res.status(404).json({ error: "not found" });
    return;
  }
  res.redirect(urlObj.url);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
