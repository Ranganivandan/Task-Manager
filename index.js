const express = require("express");
const ejs = require("ejs");
const usermiodel = require("./mongoose");
const app = express();
const path = require("path");
const exp = require("constants");
app.use(express.json());
const fs = require("fs");
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
const directory = app.use(express.static(path.join(__dirname, "views")));
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
  fs.readdir("./files", function (err, files) {
    console.log(files);
    res.render("index", { files: files });
  });
});
app.get("/files/:filename", (req, res) => {
  const filedata = fs.readFile(
    `./files/${req.params.filename}`,
    "utf-8",
    (err, filedata) => {
      res.render("show", { filename: req.params.filename, filedata: filedata });
    }
  );
});

app.post("/create", async (req, res) => {
  const { title, description } = req.body;
  fs.writeFile(
    `./files/${title.split(" ").join("")}.txt`,
    description,
    (err) => {}
  );
  res.redirect("/");
});
app.get("/edit/:filename", (req, res) => {
  res.render("edit", { filename: req.params.filename });
});
app.post("/edit", (req, res) => {
  console.log(req.body.newname);
  fs.rename(
    `./files/${req.body.previous}`,
    `./files/${req.body.newname.concat(".txt")}`,
    (err) => {}
  );
  res.redirect("/");
});
app.get("/delete/:filename", (req, res) => {
  fs.unlink(`./files/${req.params.filename}`, (err) => {});
  // res.send("delete succesfully");
  res.redirect("/");
});
app.listen(4500);
