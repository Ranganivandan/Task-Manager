const mongoose = require("mongoose");
mongoose
  .connect("mongodb://localhost:27017/notes")
  .then(() => {
    console.log("connection succesfull");
  })
  .catch((e) => {
    console.log(e);
  });

const userschema = mongoose.Schema({
  name: String,
  username: String,
  email: String,
});
module.exports = mongoose.model("user", userschema);
