'use strict'

var get_obj_id = function (obj) {
  return (obj.id) ? obj.id : null
}

var get_creeps = function (room_key) {
  var creep_counts = {}
  //var creep_types = ['archer', 'booster', 'builder', 'enershifter', 'fodder', 'guard', 'harvester', 'linkling', 'miner', 'mule', 'remote_builder', 'scout', 'striker']
  var creep_types = Object.keys(require('03_roles'))
  //console.log(creep_types)
  for (var index in creep_types) {
    var ctype = creep_types[index]
    creep_counts[ctype] = []
  }
  var lifetimes = {}
  if (!Memory.ref.lifetimes) Memory.ref.lifetimes = []

  for (let name in Game.creeps) {
    var creep = Game.creeps[name]
    var role = creep.memory.role
    // console.log(role)
    var room_name = creep.room.name
    if (room_key === room_name) {
      // console.log(creep)
      creep_counts[role].push(creep.id)
    }

    lifetimes[name] = creep.ticksToLive
  }
  console.log(JSON.stringify(lifetimes, null, 2))
  Memory.ref.lifetimes = lifetimes
  return creep_counts
}

var update_model = function () {
  for (var key in Game.rooms) {
    // only once
    if (!Memory.rooms[key])         Memory.rooms[key] = {}
    if (!Memory.rooms[key].sources) Memory.rooms[key].sources = Game.rooms[key].find(FIND_SOURCES).map(get_obj_id)
    if (!Memory.rooms[key].wallHP)  Memory.rooms[key].wallHP = 10000

    Memory.rooms[key].creep_counts = get_creeps(key)
    Memory.rooms[key].tower = Game.rooms[key].find(FIND_MY_STRUCTURES, {filter: { structureType: STRUCTURE_TOWER }}).map(get_obj_id)
    //  console.log('structures going to repair = ' + Game.rooms[key].find(FIND_STRUCTURES) )
    Memory.rooms[key].needsRepair = get_repair_target(Game.rooms[key].find(FIND_STRUCTURES).map(get_obj_id))
  }
}

var get_repair_target = function (structures) {
  var most_need = 1
  var struct_need = null
  var pct = 0

  for (var key in structures) {
    var structure = Game.getObjectById(structures[key])
    // calculate most need
    if ((structure.structureType === STRUCTURE_RAMPART) || (structure.structureType === STRUCTURE_WALL)) {
      pct = (structure.hits / Memory.rooms[structure.room.name].wallHP)
    } else {
      pct = (structure.hits / structure.hitsMax)
    }

    if (pct < most_need) {
      most_need = pct
      struct_need = structure.id
    }
  }
  let struct = Game.getObjectById(struct_need)
  let struct_life = (100 * most_need).toPrecision(6)
  let room_name = struct.room.name
  console.log(room_name + '\t repair target ' + struct + '\t' + struct.pos.x + ', ' + struct.pos.y + '\t\t' + struct_life + '% - ' + struct.hits)
  return struct_need
}

var garbage_collect = function () {
  for (var key in Memory.creeps) {
    if (!Game.creeps[key]) {
      delete Memory.creeps[key]
      console.log('Cleaned up ' + key)
    }
  }
}

module.exports = {
  update_model: update_model,
  get_repair_target: get_repair_target,
  garbage_collect: garbage_collect
}
