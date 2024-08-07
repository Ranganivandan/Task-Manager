const express = require("express");
const multerconfilg = require("./utils/multer");
const Postmodel = require("./post");
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
const { profile } = require("console");
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
  try {
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
  } catch (e) {
    res.send(
      "<h1>Sorry,we cant reach the site please first login and then try again</h1>"
    );
  }
});
app.post(
  "/profileimg",
  isLoggedin,
  multerconfilg.single("image"),
  async (req, res) => {
    // console.log(req.file.filename);
    const userId = req.cookies.userdata;

    let user = await usermodel.findOne({ _id: userId._id });
    // console.log(user[0].profilepic);
    // console.log(req.file.filename);
    user.profilepic = req.file.filename;
    // console.log(user);
    // console.log("User name:");
    await user.save();
    // console.log(result);
    res.redirect("/profile");
  }
);

app.get("/logout", (req, res) => {
  res.clearCookie("userdata");
  res.clearCookie("token");
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
      const user = await usermodel.create({ name, email, password: hash });
      const token = jwt.sign({ _id: user._id }, "userdata", {
        expiresIn: "20000000",
      });
      const cookietoken = res.cookie("token", token, {
        expires: new Date(Date.now() + 20000000),
        httpOnly: true,
      });
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
function isLoggedin(req, res, next) {
  const token = req.cookies.token; // Access the token from cookies

  if (!token) {
    return res.status(401).send("<h1>Please log in to access this page</h1>");
  }

  // Token exists, so proceed to the next middleware/route handler
  next();
}

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
        // req.session.user = { name: existinuser.name };
        const cookies = res.cookie("userdata", existinuser, {
          expires: new Date(Date.now() + 20000000),
          httpOnly: true,
        });
        const token = jwt.sign({ _id: existinuser._id }, "userdata", {
          expiresIn: "20000000",
        });
        const cookietoken = res.cookie("token", token, {
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
app.get("/posts", async (req, res) => {
  const users = await usermodel.find({}).populate("posts");

  res.render("allposts", { users });
});

app.get("/delete/:postid", async (req, res) => {
  const { postid } = req.params;
  const users = await usermodel.find({}).populate("posts");
  const post = await Postmodel.findById(postid);
  if (!post) {
    return res.status(404).send("Post not found");
  }

  await Postmodel.findByIdAndDelete(post);
  res.redirect("/profile");
});

app.get("/profile", isLoggedin, async (req, res) => {
  let user = await usermodel
    .findOne({ email: req.cookies.userdata.email })
    .populate("posts");
  console.log("User Profile Pic:", user.profilepic);
  res.render("post", { user });
});
app.post("/post", isLoggedin, async (req, res) => {
  const { content } = req.body;
  let user = await usermodel.findOne({ email: req.cookies.userdata.email });
  let post = await Postmodel.create({ user: user._id, content });
  user.posts.push(post._id);
  await user.save();
  return res.redirect("/profile");
});
app.get("/posts", async (req, res) => {
  try {
    // Verify the token
    const verifies = jwt.verify(req.cookies.token, "userdata");

    // If verification succeeds, send a response
    res.send("Hello, authenticated user!");
  } catch (err) {
    // If verification fails, send an error message
    res.status(401).send("<h1>First login and then try again</h1>");
  }
});

app.post("/create", async (req, res) => {
  const { title, description } = req.body;
  const paths = path.join(
    __dirname,
    "files",
    req.cookies.userdata.name.split(" ").join("")
  );

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
