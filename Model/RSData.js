const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MutationAnimationSchema = new Schema({
  offSpring: [Number],
  population: [Number],
  sense: {
    average: [Number],
    max: [Number],
    max: [Number],
  },
  size: {
    average: [Number],
    max: [Number],
    min: [Number],
  },
  stamina: {
    average: [Number],
    max: [Number],
    min: [Number],
  },
});

const populationSchema = new Schema({
  "20%": { type: [Number], default: [] },
  "80%": { type: [Number], default: [] },
});

module.exports = { MutationAnimationSchema, populationSchema };
