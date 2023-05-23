const mongoose = require("mongoose");
const {
  MutationAnimationSchema,
  populationSchema,
} = require("../Model/RSData");

const getMutationProb = async (req, res) => {
  let chosenModel;

  const twenty = mongoose.model("20%", MutationAnimationSchema);
  const eighty = mongoose.model("80%", MutationAnimationSchema);

  if ((await twenty.count({})) > (await eighty.count({}))) {
    chosenModel = eighty;
  } else {
    chosenModel = twenty;
  }

  res.json({ mutationProb: parseFloat(chosenModel.modelName) / 100 });
};
const getALL = async (req, res) => {
  const populationModel = mongoose.model("populations", populationSchema);
  const populationDocument = await populationModel.findOne({});

  res.status(200).json(populationDocument);
};

const postData = async (req, res) => {
  const { modelName, document } = req.body;

  if (!modelName || !document)
    return res.status(400).json("Not sufficient information");

  const model = mongoose.model(modelName, MutationAnimationSchema);
  const postedData = await model.create({ ...document });

  res.status(203).json("successfully posted");
};

const getAllPopulation = async (req, res) => {
  const twenty = mongoose.model("20%", MutationAnimationSchema);
  const eighty = mongoose.model("80%", MutationAnimationSchema);

  let twentyEndPopulation = await twenty.find({});

  twentyEndPopulation = twentyEndPopulation.map(
    (document) => document.population[document.population.length - 1]
  );

  let eightyEndPopulation = await eighty.find({});

  eightyEndPopulation = eightyEndPopulation.map(
    (document) => document.population[document.population.length - 1]
  );

  const population = mongoose.model("population", populationSchema);

  if ((await population.count({})) === 0) {
    await population.create({});
  }

  await population
    .updateOne(
      {},
      { $set: { "20%": twentyEndPopulation, "80%": eightyEndPopulation } }
    )
    .exec();
};

module.exports = { getMutationProb, postData, getAllPopulation, getALL };
