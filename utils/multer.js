const express = require("express");
const multer = require("multer");
const path = require("path");

// Multer configuration (from the previous snippet)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + ".jpg";
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const multerconfig = multer({ storage: storage });

module.exports = multerconfig;
