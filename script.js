function constructItem(name, reqItems, outputCount) {
  return {
    name: name,
    reqItems: reqItems,
    outputCount: outputCount
  }
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
// Components
  constructItem("Iron Ingot", {"Iron Ore": 5}, 10),
  constructItem("Copper Ingot", {"Copper Ore": 5}, 10),
  constructItem("Erestrum Ingot", {"Erestrum Ore": 5}, 10),
  constructItem("Zascosium Ingot", {"Zascosium Ore": 5}, 10),
  constructItem("Silicon Ingot", {"Silicon Ore": 5}, 10),
  constructItem("Magnesium Ingot", {"Magnesium Ore": 5}, 10),
  constructItem("Promethium Pellets", {"Promethium Ore": 5}, 10),

  constructItem("Zascosium Alloy", {"Erestrum Ingot": 5, "Zascosium Ingot": 5}, 1),
  constructItem("Erestrum Gel", {"Erestrum Ingot": 2}, 1),
  constructItem("Steel Plate", {"Iron Ingot": 2}, 10),
  constructItem("Electronics", {"Copper Ingot": 2, "Silicon Ingot": 1}, 10),

  constructItem("Pistol Round", {"Steel Plate": 5, "Promethium Pellets": 2}, 10),
  constructItem("Projectile Rifle Round", {"Steel Plate": 10, "Promethium Pellets": 2}, 25),
  constructItem("Shotgun Shell", {"Steel Plate": 2, "Promethium Pellets": 2}, 5),
  constructItem("Sniper Rifle Round", {"Steel Plate": 2, "Promethium Pellets": 2}, 5),
  constructItem("Minigun Round", {"Steel Plate": 10, "Promethium Pellets": 2}, 50),
  constructItem("Rocket Launcher Missile", {"Steel Plate": 25, "Promethium Pellets": 20}, 5),
  constructItem("Rocket Launcher Homing Missile", {"Steel Plate": 30, "Promethium Pellets": 40}, 6),
  constructItem("Laser Pistol Cell", {"Steel Plate": 10, "Electronics": 1, "Promethium Pellets": 10}, 20),
  constructItem("Laser Rifle Cell", {"Steel Plate": 12, "Erestrum Gel": 5, "Electronics": 1}, 25),

  constructItem("15mm Bullet", {"Steel Plate": 10, "Promethium Pellets": 5}, 100),
  constructItem("130mm MSL", {"Steel Plate": 20, "Promethium Pellets": 50, "Electronics": 1}, 5),
]
let ITEMS = itemListToObject(ITEM_LIST)

function constructWeapon(name, reqItems, outputCount, placeable,
    ammo, damage, magazine, range, rof, reload) {
  let obj = constructItem(name, reqItems, outputCount)
  obj.placeable = placeable
  obj.ammo = ammo
  obj.damage = damage
  obj.magazine = magazine
  obj.range = range
  obj.rof = rof
  obj.reload = reload
  return obj
}

const BA = 2
const CV = 3
const HV = 4
const SV = 5

let WEAPON_LIST = [
  constructWeapon("Projectile Pistol", {"Mechanical Components": 5}, 1, [],
    "Pistol Round", 42, 10, 90, 300, 2.1),
  constructWeapon("Projectile Pistol (T2)", {"Mechanical Components": 5, "Projectile Pistol": 1}, 1, [],
    "Pistol Round", 50, 15, 90, 400, 2.1),
  constructWeapon("Assault Rifle", {"Mechanical Components": 5, "Electronics": 1}, 1, [],
    "Projectile Rifle Round", 70, 20, 150, 300, 3.1),

  constructWeapon("Rail Gun", {}, 1, [SV],
    "Railgun Bullet", 160, 20, 530, 40, 4),
  constructWeapon("Gatling Gun", {}, 1, [SV, HV],
    "15mm Bullet", 7, 300, 460, 600, 2),
  constructWeapon("Pulse Laser", {}, 1, [SV],
    "Ls.Charge SV", 33, 150, 500, 120, 1),
  constructWeapon("Plasma Cannon", {}, 1, [SV],
    "Pl.Charge SV", 54, 50, 460, 75, 3)
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

function createRow(list) {
  let tr = document.createElement("tr")
  for (let i = 0; i < list.length; i++) {
    let td = document.createElement("td")
    tr.appendChild(td)
    let text = document.createTextNode(list[i])
    td.appendChild(text)
  }
  return tr
}

function getOrZero(object, name) {
  let data = object[name]
  return (data != undefined ? data : 0)
}

window.onload = () => {

  let root = document.getElementById("data")

  for (name in WEAPONS) {
    let item = WEAPONS[name]
    let ammo = EXPANDED_ITEMS[item.ammo]
    if (!ammo) {
      console.log("ammo missing: " + item.ammo)
      continue
    }
    let reqItems = ammo.reqItems

    let iron = getOrZero(reqItems, "Iron Ore")
    let copper = getOrZero(reqItems, "Copper Ore")
    let silicon = getOrZero(reqItems, "Silicon Ore")
    let promethium = getOrZero(reqItems, "Promethium Ore")
    let magnesium = getOrZero(reqItems, "Magnesium Ore")
    let cobalt = getOrZero(reqItems, "Cobalt Ore")
    let erestrum = getOrZero(reqItems, "Erestrum Ore")
    let zascosium = getOrZero(reqItems, "Zascosium Ore")

    let oreCount = iron + copper + silicon + promethium + magnesium +
      cobalt + erestrum + zascosium
    let roundsPerOre = ammo.outputCount / oreCount
    let damagePerOre = item.damage / roundsPerOre

    let tr = createRow([item.name, ammo.name, ammo.outputCount,
      iron, copper, silicon, promethium, magnesium, cobalt, erestrum, zascosium,
      oreCount, roundsPerOre, damagePerOre
    ])
    root.appendChild(tr)
  }
}
