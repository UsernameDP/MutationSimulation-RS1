class MutationSimulation {
  constructor(
    speedAmp = 2,
    sizeAmp = 3,
    senseAmp = 10,
    energyUnit = 5000,
    reproduceProb = 0.5,
    mutationProb = 0.5,
    timeCutOff = 0.5,
    timeIncrement = 0.001
  ) {
    this.speedAmp = speedAmp;
    this.sizeAmp = sizeAmp;
    this.senseAmp = senseAmp;
    this.energyUnit = energyUnit;
    this.reproduceProb = reproduceProb;
    this.mutationProb = mutationProb;
    this.timeCutOff = timeCutOff;
    this.timeIncrement = timeIncrement;
  }

  initForDB = async () => {
    this.mutationProb = await fetch("/data/GET", { method: "GET" }).then(
      (res) => res.json,
      (err) => console.log(`${err.name}\t${err.message}`)
    );
  };

  run = async () => {};
}
