const randRange = (a, b) => {
  return Math.random() * (b - a) + a;
};
const randCoord = (r = 0) => {
  return [
    randRange(r, globalThis.width - r),
    randRange(r, globalThis.height - r),
  ];
};
const randQuad = (quadratic = []) => {
  let term = quadratic.length;
  //alters the already given terms of quadratic
  for (i of quadratic) {
    if (randRange(0, 1) <= mutationProb) {
      i += randRange(-0.5, 0.5);
    }
  }
  //new values
  while (true) {
    if (randRange(0, 1) <= 1 / term ** 2) {
      quadratic.push(randRange(-1, 1));
      term++;
    } else {
      break;
    }
  }
  return quadratic;
};

const randCircleSize = (size = 1, food = false) => {
  let mutationProbUse = food ? 1 : mutationProb;
  //a mutation is practically guaranteed
  let added = 0;
  let counter = 1;
  while (true) {
    if (randRange(0, 1) <= (1 / counter) * mutationProbUse) {
      added += Math.round(randRange(-1, 1)); //change the range if it deviates to 50%, same for randQuad
      counter++;
    } else {
      break;
    }
  }
  return Math.abs((size += added));
};

export { randRange, randCoord, randQuad, randCircleSize };
