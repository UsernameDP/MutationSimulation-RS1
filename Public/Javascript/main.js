import { setConditions } from "./setConditions.js";

let SPD,
  SD,
  SED,
  SPA,
  SA,
  SEA,
  creatureFoodNerf,
  reproduceProb,
  mutationProb,
  timeCutOff,
  timeIncrement,
  energyUnit;

let canvas = document.querySelector("#canvas");
let c = canvas.getContext("2d");

let width = window.innerWidth;
let height = window.innerHeight;

canvas.width = width;
canvas.height = height;

const removeOne = (array, obj) => {
  for (let i = 0; array.length; i++) {
    if (array[i] == obj) {
      array.splice(i, 1);
      break;
    }
  }
};

const randRange = (a, b) => {
  return Math.random() * (b - a) + a;
};
const randCoord = (r = 0) => {
  return [randRange(r, width - r), randRange(r, height - r)];
};
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
const randQuad = (quadratic = []) => {
  let term = quadratic.length;
  //alters the already given terms of quadratic
  for (let i of quadratic) {
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
  const theFunction = (x) => {
    return (
      (size / SD) ** 3 * (evaluatePolynomial(actualSpeed, x) / SPD) +
      sense / SED
    );
  };
  return theFunction;
};
//if i want to add a feature that food gives you energy, i can't create a function, because the energy cap always remains the same, so probably will need to work with derivatives instead
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
const twoCircleCollison = (c1, c2, sense = true) => {
  //if sense is true, then use the sense radius + size
  //if sense is false, then just use size radius
  const distance = dist(c1, c2);
  if (sense) {
    if (
      c1.size * SA + c1.sense * SEA + (c2.size * SA + c2.sense * SEA) >=
      distance
    ) {
      return { result: true, dist: distance };
    } else {
      return { result: false };
    }
  } else {
    if (c1.size * SA + c2.size * SA >= distance) {
      return { result: true, dist: distance };
    } else {
      return { result: false };
    }
  }
};
const getEnergyFromFood = (cre, food) => {
  let foodGive;
  if (food.dead == true) {
    foodGive = food.decayFood / creatureFoodNerf;
  } else {
    foodGive = (energyUnit * food.size) / creatureFoodNerf;
  }
  if (cre.currentEnergy + foodGive >= cre.maxEnergy) {
    cre.currentEnergy = cre.maxEnergy;
  } else {
    cre.currentEnergy += foodGive;
  }
};
const creatureAndList = (c1, lol) => {
  //i said list"s" in the case creatures can also eat creatures
  //true is food, false is creature list
  let minDst = { obj: undefined, dist: undefined };
  let tempBreak = false;
  for (let list of lol) {
    //lists are food list
    let sizeToEat; //if it is food, it can be whatever size, if it is creature, then it needs to be 50%
    switch (list.name) {
      case "foods":
        sizeToEat = 1;
        break;
      case "creatures":
        sizeToEat = 0.6;
        break;
    }
    for (let i in list.data) {
      const tempDist = twoCircleCollison(c1, list.data[i], true);
      if (tempDist.result) {
        if (
          twoCircleCollison(c1, list.data[i], false).result &&
          list.data[i].size <= c1.size * sizeToEat
        ) {
          getEnergyFromFood(c1, list.data[i]);
          list.data.splice(i, 1);
          c1.food++;
          tempBreak = true;
          break;
        } else {
          if (
            minDst.obj == undefined &&
            list.data[i].size <= c1.size * sizeToEat
          ) {
            [minDst.obj, minDst.dist] = [list.data[i], tempDist.dist];
          } else if (
            tempDist.dist < minDst.dist &&
            list.data[i].size <= c1.size * sizeToEat
          ) {
            [minDst.obj, minDst.dist] = [list.data[i], tempDist.dist];
          }
        }
      }
    }
    if (tempBreak) {
      break;
    }
  }
  if (typeof minDst.dist == "number") {
    c1.angle = findAngle(minDst.obj, c1); //if you swap c1 and minDst, it somehow makes a collison system
  }
};

class Food {
  constructor(r = 1) {
    this.x;
    this.y;
    this.size = randCircleSize(r, true);
    this.sense = 0;
  }
}

class foodList {
  constructor() {
    this.list = { name: "foods", data: [] };
  }
  randomlySpawnFood = (numberOfFood) => {
    for (let i = 0; i < numberOfFood; i++) {
      let foodObj = new Food();
      [foodObj.x, foodObj.y] = randCoord(foodObj.size);
      this.list.data.push(foodObj);
    }
  };
  draw = () => {
    this.list.data.forEach((f) => {
      c.beginPath();
      c.fillStyle = "red";
      c.strokeStyle = "red";
      c.arc(f.x, f.y, f.size, 0, Math.PI * 2, false);
      c.fill();
      c.stroke();
    });
  };
}

class creature {
  constructor(size = 1, sense = 1, stamina = [], energy) {
    this.x;
    this.y;
    this.stamina = randQuad(stamina);
    this.speed;
    this.size = randCircleSize(size);
    this.sense = randCircleSize(sense);
    this.angle = randRange(0, Math.PI * 2);
    this.startEnergy = energy || this.size * energyUnit;
    this.currentEnergy = this.startEnergy;
    this.energyLossfunction = createEnergyLossfunction(
      this.size,
      this.stamina,
      this.sense
    );
    this.color;
    this.dead = false;
    this.decayFood = energyUnit * this.size;
    this.offSpringNum = 0;
    this.time = randRange(0, 1);
    this.maxEnergy = this.size * energyUnit;
  }
  wallCollide = () => {
    let angle = this.angle;
    let offsetX;
    let offsetY;
    if (this.x - this.size <= 0 || this.x + this.size >= width) {
      this.angle = Math.atan2(Math.sin(angle), -Math.cos(angle));
      offsetX =
        this.x - this.size <= 0
          ? this.size - this.x
          : width - this.x - this.size;
      this.x += offsetX;
    }
    if (this.y - this.size <= 0 || this.y + this.size >= height) {
      this.angle = Math.atan2(-Math.sin(angle), Math.cos(angle));
      offsetY =
        this.y - this.size <= 0
          ? this.size - this.y
          : height - this.y - this.size;
      this.y += offsetY;
    }
  };
  move = (lists) => {
    this.time = this.time > timeCutOff ? randRange(0, timeCutOff) : this.time;
    if (this.currentEnergy > 0) {
      const speedFunction = derivative(this.stamina); //just let stamina be the integral(distance traveled in total)
      const currentVelocity =
        evaluatePolynomial(speedFunction, this.time) / (this.size / SD);
      if (randRange(0, 1) <= 0.5) {
        this.angle += randRange(-0.1, 0.1);
      }
      creatureAndList(this, lists);

      this.wallCollide();
      this.speed = {
        x: currentVelocity * Math.cos(this.angle),
        y: currentVelocity * Math.sin(this.angle),
      };
      this.x += this.speed.x;
      this.y += this.speed.y;

      this.currentEnergy -= this.energyLossfunction(this.time);

      const colorPercent =
        this.currentEnergy / this.startEnergy > 0
          ? this.currentEnergy / this.startEnergy
          : 0;
      this.color = `rgba(252, 255, 255, ${colorPercent})`;

      this.time += timeIncrement;
    } else {
      this.dead = true;
    }
  };
  decay = () => {
    const percentDecayFromMaxEnergy = 0.001;
    this.decayFood -= this.maxEnergy * percentDecayFromMaxEnergy;
  };
  reproduce = () => {
    let reproduced = [];
    const percentOfEnergyFromParent = 0.5;
    const percentOfMaxEnergy = 0.4;
    const regulateProbOfReproduction = 100;
    while (
      this.currentEnergy * (1 - percentOfEnergyFromParent) >=
        this.maxEnergy * percentOfMaxEnergy &&
      randRange(0, 1) <= reproduceProb / regulateProbOfReproduction
    ) {
      const energyRemovedFromParent =
        this.currentEnergy * percentOfEnergyFromParent;
      this.currentEnergy = this.currentEnergy - energyRemovedFromParent; //all energy after a certain point should be sent to child, child's start energy will not be max
      const NCrea = new creature(
        this.size,
        this.sense,
        this.stamina,
        energyRemovedFromParent
      );
      [NCrea.x, NCrea.y] = [this.x, this.y];
      reproduced.push(NCrea);
      this.offSpringNum++;
    }
    return reproduced;
  };
}

class creatureList {
  constructor() {
    this.list = { name: "creatures", data: [] };
    this.RSData = { offSpring: [], population: [] };
    this.totalOffSprings = 0;
  }
  resetCoord = () => {
    this.list.data.forEach((cre) => {
      cre.x = cre.y = null;
    });
  };
  setUpCreatures = (numberOfCreatures) => {
    this.resetCoord();
    for (let i = 0; i < numberOfCreatures; i++) {
      let creatureObj = new creature();
      [creatureObj.x, creatureObj.y] = randCoord(creatureObj.size);
      this.list.data.push(creatureObj);
    }
  };
  moveCreatures = (relativeList) => {
    this.list.data.forEach((cre) => {
      if (cre.dead == false) {
        cre.move(relativeList); //relativeList is the foodList
        let reproduced = cre.reproduce();
        if (reproduced.length > 0) {
          reproduced.forEach((creAdd) => {
            this.list.data.push(creAdd);
          });
          this.totalOffSprings += reproduced.length;
        }
      } else {
        if (cre.decayFood <= 0) {
          removeOne(this.list.data, cre);
        } else {
          cre.decay();
        }
      }
    });
  };
  draw = () => {
    this.list.data.forEach((cre) => {
      c.beginPath();
      c.arc(
        cre.x,
        cre.y,
        cre.size * SA + cre.sense * SEA,
        0,
        Math.PI * 2,
        false
      );
      c.strokeStyle = "lightblue";
      c.lineWidth = 0.5;
      c.stroke();

      c.beginPath();
      c.fillStyle = cre.color;
      c.arc(cre.x, cre.y, cre.size * SA, 0, Math.PI * 2, false);
      c.fill();
      c.stroke();

      c.beginPath();
      c.moveTo(cre.x, cre.y);
      c.lineTo(
        cre.x + (cre.sense * SEA + cre.size * SA) * Math.cos(cre.angle),
        cre.y + (cre.sense * SEA + cre.size * SA) * Math.sin(cre.angle)
      );
      c.strokeStyle = "rgba(14, 226, 230,0.2)";
      c.lineWidth = 5;
      c.stroke();
    });
  };
  grabAverageOfObject = (objName) => {
    let totalSum = 0;
    const numberOfCreatures = this.list.data.length;
    const tickToEvaluatePolynomial = timeCutOff;
    let addValueToTotal =
      objName == "stamina"
        ? (polynomial) => {
            return evaluatePolynomial(polynomial, tickToEvaluatePolynomial);
          }
        : (value) => {
            return value;
          };
    for (let cre of this.list.data) {
      totalSum += addValueToTotal(cre[objName]);
    }
    return totalSum / numberOfCreatures;
  };
  grabMaximumOfObject = (objName) => {
    const tickToEvaluatePolynomial = timeCutOff;
    let changeValueOfMaximum =
      objName == "stamina"
        ? (polynomial) => {
            return evaluatePolynomial(polynomial, tickToEvaluatePolynomial);
          }
        : (value) => {
            return value;
          };
    let maximumValue = changeValueOfMaximum(this.list.data[0][objName]);
    for (let cre of this.list.data) {
      const isItBigger = changeValueOfMaximum(cre[objName]);
      maximumValue = maximumValue < isItBigger ? isItBigger : maximumValue;
    }
    return maximumValue;
  };
  grabMinimumOfObject = (objName) => {
    const tickToEvaluatePolynomial = timeCutOff;
    let changeValueOfMaximum =
      objName == "stamina"
        ? (polynomial) => {
            return evaluatePolynomial(polynomial, tickToEvaluatePolynomial);
          }
        : (value) => {
            return value;
          };
    let minimumValue = changeValueOfMaximum(this.list.data[0][objName]);
    for (let cre of this.list.data) {
      const isItSmaller = changeValueOfMaximum(cre[objName]);
      minimumValue = minimumValue > isItSmaller ? isItSmaller : minimumValue;
    }
    return minimumValue;
  };
  grabData = () => {
    //Record stamina, size, sensing, total reproduction in the momment
    let objectNames = ["stamina", "size", "sense"];
    for (let objectNameToGrab of objectNames) {
      if (this.RSData[objectNameToGrab]) {
        this.RSData[objectNameToGrab].average.push(
          Number.parseFloat(
            this.grabAverageOfObject(objectNameToGrab).toFixed(2)
          )
        );
        this.RSData[objectNameToGrab].max.push(
          this.grabMaximumOfObject(objectNameToGrab)
        );
        this.RSData[objectNameToGrab].min.push(
          this.grabMinimumOfObject(objectNameToGrab)
        );
      } else {
        this.RSData[objectNameToGrab] = { average: [], max: [], min: [] };
        this.RSData[objectNameToGrab].average.push(
          Number.parseFloat(
            this.grabAverageOfObject(objectNameToGrab).toFixed(2)
          )
        );
        this.RSData[objectNameToGrab].max.push(
          this.grabMaximumOfObject(objectNameToGrab)
        );
        this.RSData[objectNameToGrab].min.push(
          this.grabMinimumOfObject(objectNameToGrab)
        );
      }
    }
    this.RSData.offSpring.push(this.totalOffSprings);
    this.RSData.population.push(this.list.data.length);
    this.changeDisplayData();
  };

  changeDisplayData = () => {
    function changeData(querySeletor, index, data) {
      const textElement = document.querySelectorAll(querySeletor)[index];
      textElement.innerText = "[" + data + "]";
    }

    changeData("span", 0, this.RSData.offSpring);
    changeData("span", 1, this.RSData.size.average);
    changeData("span", 2, this.RSData.sense.average);
    changeData("span", 3, this.RSData.stamina.average);
    changeData("span", 4, this.RSData.population);
  };
  changeDisplayTime = (t) => {
    document.querySelector(
      "#timeDisplay"
    ).innerText = `Time: ${t}\nGeneration: ${Math.floor(t)}`;
  };
}

async function main(gen) {
  [
    SPD,
    SD,
    SED,
    SPA,
    SA,
    SEA,
    creatureFoodNerf,
    reproduceProb,
    mutationProb,
    timeCutOff,
    timeIncrement,
    energyUnit,
  ] = await setConditions();

  console.log(`MutationProb : ${mutationProb}`);

  let generation = new creatureList();
  let foods = new foodList();
  let startingCreatures = 3;

  generation.setUpCreatures(startingCreatures);
  foods.randomlySpawnFood(100);

  let t = 0;

  function animate() {
    if (
      generation.list.data.length > 0 &&
      generation.RSData.offSpring.length <= gen
    ) {
      if (t % 1 == 0) {
        generation.grabData();
      }
      c.clearRect(0, 0, width, height);
      generation.moveCreatures([foods.list, generation.list]);
      foods.draw();
      generation.draw();
      if (randRange(0, 1) <= 0.2) {
        foods.randomlySpawnFood(1);
      }
      t += timeIncrement;
      t = Number.parseFloat(t.toFixed(3));

      generation.changeDisplayTime(t);
      requestAnimationFrame(animate);
    } else {
      console.log("60 Generations DONE");
      console.log(generation.RSData);
      saveToDB(`${mutationProb * 100}%`, generation.RSData);

      setTimeout(() => {
        location.reload();
      }, 5000);
    }
  }
  animate();

  return generation.RSData;
}

const saveToDB = async (modelName, document) => {
  await fetch("data/POST", {
    method: "POST",
    body: JSON.stringify({ modelName: modelName, document: document }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  await fetch("data/PATCHPOP", { method: "PATCH" });
};

export default main;
