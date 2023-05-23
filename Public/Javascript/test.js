function empiricalPercentage(mean, SD, data) {
  for (let amp = 1; amp <= 3; amp++) {
    let empiricalList = [];
    for (let dataPiece of data) {
      if (dataPiece <= mean + SD * amp && dataPiece >= mean - SD * amp) {
        empiricalList.push(dataPiece);
      }
    }
    console.log(
      `Range : (${mean - SD * amp} , ${mean + SD * amp})\nPopulation : ${
        empiricalList.length
      }\nPercentage : ${empiricalList.length / data.length}`
    );
    console.log("---------------------------");
  }
}

async function main() {
  const data = await fetch("http://localhost:3500/data/getALL").then(
    (res) => res.json(),
    (err) => console.error(err)
  );
  data["20%"] = data["20%"].splice(0, 30);
  data["80%"] = data["80%"].splice(0, 30);

  empiricalPercentage(187.5, 59.024, data["20%"]);
  empiricalPercentage(112.467, 49.891, data["80%"]);
}

main();
