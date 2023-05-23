//sets the conditions the program runs on

async function setConditions() {
  // SPD
  // SD
  // SED
  // SPA
  // SA
  // SEA
  //decayFoodNerf
  // reproduceProb
  // mutationProb
  // timeCutOff
  // timeIncrement
  // energyUnit
  const conditions = [
    2,
    3, //energy depletion
    1,
    1,
    1, //effect amplification
    20,
    2,
    0.05,
    await fetch("/data/GET")
      .then(
        (res) => res.json(),
        (err) => console.error(err)
      )
      .then((data) => data.mutationProb),
    0.5,
    0.001,
    5000,
  ];
  return conditions;
}

export { setConditions };
