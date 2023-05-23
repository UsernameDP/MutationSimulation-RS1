const removeOne = (array, obj) => {
  for (let i = 0; array.length; i++) {
    if (array[i] == obj) {
      array.splice(i, 1);
      break;
    }
  }
};

const twoCircleCollison = (c1, c2, sense = true) => {
  //if sense is true, then use the sense radius + size
  //if sense is false, then just use size radius
  const distance = dist(c1, c2);
  if (sense) {
    if (c1.size + c1.sense + (c2.size + c2.sense) >= distance) {
      return { result: true, dist: distance };
    } else {
      return { result: false };
    }
  } else {
    if (c1.size + c2.size >= distance) {
      return { result: true, dist: distance };
    } else {
      return { result: false };
    }
  }
};

const getEnergyFromFood = (cre, food) => {
  let foodGive;
  if (food.dead == true) {
    foodGive = food.decayFood;
  } else {
    foodGive = (maxEnergy / 10) * food.size;
  }
  if (cre.currentEnergy + foodGive >= maxEnergy) {
    cre.currentEnergy = maxEnergy;
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
        sizeToEat = 0.75;
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

export { removeOne, twoCircleCollison, getEnergyFromFood, creatureAndList };
