function xmlRequest(resource, callback) {
  var xhr = new XMLHttpRequest()
  xhr.open("GET", resource, true)
  xhr.responseType = "text"
  xhr.onload = function (e) {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        callback(xhr.responseText)
      } else {
        console.error(xhr.statusText)
      }
    }
  }
  xhr.onerror = function (e) {
    console.error(xhr.statusText)
  };
  xhr.send(null)
}

function itemListToObject(list) {
  let object = {}
  for (let i = 0; i < list.length; i++) {
    let item = list[i]
    object[item.name] = item
  }
  return object
}

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

  var data = ""
  xmlRequest("data.yaml", (data) => {
    let doc = jsyaml.load(data);
    let items = itemListToObject(doc.items)
    let expandedItems = expandResourceCostForAll(items)

    let root = document.getElementById("data")

    for (name in items) {
      let item = items[name]
      let ammo = expandedItems[item.ammo]
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
  })
}
