function constructItem(name, reqItems, outputCount) {
  return {
    name: name,
    reqItems: reqItems,
    outputCount: outputCount
  }
}

function constructWeapon(name, reqItems, outputCount, damage) {
  let obj = constructItem(name, reqItems, outputCount)
  obj.damage = damage
  return obj
}

function itemListToObject(list) {
  let object = {}
  for (let i = 0; i < list.length; i++) {
    let item = list[i]
    object[item.name] = item
  }
  return object
}

let ITEM_LIST = [
  constructItem("Iron Ingot", {"Iron Ore": 5}, 10),
  constructItem("Copper Ingot", {"Copper Ore": 5}, 10),
  constructItem("Erestrum Ingot", {"Erestrum Ore": 5}, 10),
  constructItem("Zascosium Ingot", {"Zascosium Ore": 5}, 10),
  constructItem("Silicon Ingot", {"Silicon Ore": 5}, 10),
  constructItem("Magnesium Ingot", {"Magnesium Ore": 5}, 10),
  constructItem("Promethium Pellets", {"Promethium Ore": 5}, 10),

  constructItem("Steel Plates", {"Iron Ingot": 2}, 10),
  constructItem("Electronics", {"Copper Ingot": 2, "Silicon Ingot": 1}, 10),

  constructItem("15mm Bullet", {"Steel Plates": 10, "Promethium Pellets": 5}, 100),
  constructItem("130mm MSL", {"Steel Plates": 20, "Promethium Pellets": 50, "Electronics": 1}, 5),
]
let ITEMS = itemListToObject(ITEM_LIST)

let WEAPON_LIST = [
  constructWeapon("Assault Rifle", [], 1, 40)
]
let WEAPONS = itemListToObject(WEAPON_LIST)

function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj))
}

// replace reqItems property with lower level equivalent items
function expandResourceCost(item, items) {
  let newItem = deepCopy(item)
  var done = false
  while (!done) {
    done = true
    let reqItems = newItem.reqItems
    newItem.reqItems = {}
    for (reqName in reqItems) {
      let reqCount = reqItems[reqName]
      let reqItem = items[reqName]
      if (reqItem == undefined) { // required item has no further requirements
        newItem.reqItems[reqName] = reqCount // keep as is
      } else {
        done = false
        for (newReqName in reqItem.reqItems) {
          let newReqCount = reqItem.reqItems[newReqName]
          newItem.reqItems[newReqName] = newReqCount * reqCount / reqItem.outputCount
        }
      }
    }
  }
  return newItem
}

function expandResourceCostForAll(items) {
  let result = deepCopy(items)
  for (name in items) {
    result[name] = expandResourceCost(items[name], result)
  }
  return result
}

let EXPANDED_ITEMS = expandResourceCostForAll(ITEMS)

window.onload = () => {
  console.log("onload")

  console.log("expanded")
  for (name in EXPANDED_ITEMS) {
    console.log(EXPANDED_ITEMS[name])
  }

  for (weapon in WEAPONS)  {
    console.log(weapon)
  }
}
