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
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: { type: String, required: true, trim: true, minlength: 6 },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "post" }],
  profilepic: {
    type: String,
    default: "https://via.placeholder.com/200",
  },
});
module.exports = mongoose.model("user", userschema);
