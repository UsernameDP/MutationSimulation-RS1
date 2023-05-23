const express = require("express");
const router = express.Router();
const path = require("path");
const {
  postData,
  getMutationProb,
  getAllPopulation,
  getALL,
} = require("../../Middleware/handleModel");

router.get("^/GET$", getMutationProb);
router.get("^/GETALL$", getALL);
router.post("^/POST$", postData);
router.patch("^/PATCHPOP$", getAllPopulation);

module.exports = router;
