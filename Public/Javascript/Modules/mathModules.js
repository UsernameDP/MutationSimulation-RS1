const derivative = (terms) => {
  //only power rule
  let itsDerivative = [];
  for (let i in terms) {
    if (i == 0) {
      continue;
    } else {
      itsDerivative.push(terms[i] * i);
    }
  }
  return itsDerivative;
};

const evaluatePolynomial = (polynomial, t) => {
  const speedFunction = polynomial;
  let currentVelocity = 0;
  for (let i in speedFunction) {
    currentVelocity += speedFunction[i] * t ** i; //nvm, i = 0 for constant term
  }
  currentVelocity = Math.abs(currentVelocity);

  return currentVelocity;
};

const createEnergyLossfunction = (size, speed, sense) => {
  const actualSpeed = derivative(speed);
  theFunction = (x) => {
    return (
      (size / SA) ** 3 * (evaluatePolynomial(actualSpeed, x) / SPA) +
      sense / SEA
    );
  };
  return theFunction;
};

const xDist = (o1, o2) => {
  return o1.x - o2.x;
};
const yDist = (o1, o2) => {
  return o1.y - o2.y;
};
const dist = (o1, o2) => {
  return Math.sqrt(xDist(o1, o2) ** 2 + yDist(o1, o2) ** 2);
};
const findAngle = (o1, o2) => {
  return Math.atan2(yDist(o1, o2), xDist(o1, o2));
};

export {
  derivative,
  evaluatePolynomial,
  createEnergyLossfunction,
  xDist,
  yDist,
  dist,
  findAngle,
};
