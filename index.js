const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ejs = require("ejs");
const session = require("express-session");
const usermodel = require("./mongoose");
let cookieParser = require("cookie-parser");
const app = express();
const path = require("path");
const exp = require("constants");
app.use(express.json());
const fs = require("fs");
app.use(cookieParser());
const { get } = require("http");
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
const directory = app.use(express.static(path.join(__dirname, "views")));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
// app.use(
//   session({
//     secret: "task",
//     saveUninitialized: true,
//     resave: true,
//   })
// );
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html", "home.html"));
});
console.log(__dirname);
app.get("/index", async (req, res) => {
  const userdataCookie = req.cookies.userdata;
  const userId = userdataCookie._id;
  const user = await usermodel.findOne({ _id: userId });
  fs.readdir(
    `./files/${user.name.split(" ").join("")}`,
    async function (err, files) {
      // console.log(files);
      const userdataCookie = req.cookies.userdata;
      if (!userdataCookie) {
        console.log("No cookies found");
        return res.redirect("/signup"); // Redirect to login if cookie is not found
      }
      const userId = userdataCookie._id;
      const user = await usermodel.findOne({ _id: userId });
      if (!user) {
        console.log("User not found");
        return res.redirect("/signup");
      }
      res.render("index", {
        files: files,
        names: user.name || "users", // Use "users" as default if user.name is not available
        username: req.cookies.userdata.name.split(" ").join(""),
      });
    }
  );
});
app.get("/logout", (req, res) => {
  res.clearCookie("userdata");
  res.redirect("/");
  console.log("signout");
});
app.get("/files/:username/:filename", (req, res) => {
  const filedata = fs.readFile(
    `./files/${req.params.username}/${req.params.filename}`,
    "utf-8",
    (err, filedata) => {
      res.render("show", {
        filename: req.params.filename,
        filedata: filedata,
      });
    }
  );
});
app.get("/signup", (req, res) => {
  res.render("form");
});
app.post("/createuser", async (req, res) => {
  const { name, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    const existinuser = await usermodel.findOne({ email });
    if (!existinuser) {
      await usermodel.create({ name, email, password: hash });

      const directoryname = fs.mkdir(
        path.join(__dirname, "files", name.split(" ").join("")),
        (err) => {
          if (err) return console.log(err);
          else {
            console.log("directory created succesfully");
          }
        }
      );

      res.redirect("/");
    } else {
      return res.status(400).send("<h1>User already exists</h1>");
    }
  } catch (err) {
    res.send(err.message);
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    const existinuser = await usermodel.findOne({ email });
    if (!existinuser) {
      return res.status(400).send("<h1>Invalid login details</h1>");
    } else {
      const verify = await bcrypt.compare(password, existinuser.password);
      if (!verify) res.send("<h1>Invalid login details</h1>");
      else {
        const token = await jwt.sign(
          { _id: existinuser._id.toString() },
          "secretkey",
          {
            expiresIn: "2000000",
          }
        );
        // req.session.user = { name: existinuser.name };
        const cookies = res.cookie("userdata", existinuser, {
          expires: new Date(Date.now() + 20000000),
          httpOnly: true,
        });
        // console.log(cookies);
        return res.redirect("/index");
      }
    }
  } catch (err) {
    res.send(err.message);
  }
});

app.post("/create", async (req, res) => {
  const { title, description } = req.body;
  const paths = path.join(
    __dirname,
    "files",
    req.cookies.userdata.name.split(" ").join("")
  );
  // if (paths) {
  // const directoryname = fs.mkdir(
  //   path.join(
  //     __dirname,
  //     "files",
  //     req.cookies.userdata.name.split(" ").join("")
  //   ),
  //   (err) => {
  //     if (err) return console.log(err);
  //     else {
  //       console.log("directory created succesfully");
  //     }
  //   }
  // );
  // }

  fs.writeFile(
    `${paths}/${title.split(" ").join("")}.txt`,
    description,
    (err) => {}
  );
  res.redirect("/index");
});
app.get("/edit/:username/:filename", (req, res) => {
  res.render("edit", { filename: req.params.filename });
});
app.post("/edit", async (req, res) => {
  const userdataCookie = req.cookies.userdata;
  const userId = userdataCookie._id;
  const user = await usermodel.findOne({ _id: userId });

  fs.rename(
    `./files/${user.name.split(" ").join("")}/${req.body.previous}`,
    `./files/${user.name.split(" ").join("")}/${req.body.newname.concat(
      ".txt"
    )}`,
    (err) => {}
  );
  res.redirect("/index");
});
app.get("/delete/:username/:filename", async (req, res) => {
  const userdataCookie = req.cookies.userdata;
  const userId = userdataCookie._id;
  const user = await usermodel.findOne({ _id: userId });

  fs.unlink(
    `./files/${user.name.split(" ").join("")}/${req.params.filename}`,
    (err) => {}
  );
  // res.send("delete succesfully");
  res.redirect("/index");
});
app.listen(4500);
