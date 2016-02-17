'use strict'

var get_obj_id = function (obj) {
  return (obj.id) ? obj.id : null
}

var get_creeps = function (room_key) {
  var creep_counts = {}
  // var creep_types = ['archer', 'booster', 'builder', 'enershifter', 'fodder', 'guard', 'harvester', 'linkling', 'miner', 'mule', 'remote_builder', 'scout', 'striker']
  var creep_types = Object.keys(require('03_roles'))
  // console.log(creep_types)
  for (var index in creep_types) {
    var ctype = creep_types[index]
    creep_counts[ctype] = []
  }
  var lifetimes = {}
  if (!Memory.ref.lifetimes) Memory.ref.lifetimes = []

  var min_life = 1500
  var min_life_name = ''
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
    if (creep.ticksToLive < min_life) {
      min_life = creep.ticksToLive
      min_life_name = name
    }
  }
  if (room_key === 'W18S3') {
    // console.log(JSON.stringify(lifetimes, null, 2))
    console.log('oldest creep ' + min_life_name + ' time to live ' + min_life)
  }
  Memory.ref.lifetimes = lifetimes
  return creep_counts
}

var update_model = function () {
  for (var room_name in Game.rooms) {
    // only once
    if (!Memory.rooms[room_name]) {
      Memory.rooms[room_name] = {
        wallHP: 10000,
        strikeStage: 0,
        strikeSize: 0
      }
    }
    if (!Memory.rooms[room_name].sources) {
      Memory.rooms[room_name].sources = Game.rooms[room_name].find(FIND_SOURCES).map(get_obj_id)
      for (let source of Memory.rooms[room_name].sources) {
        Memory.ref.sources[source] = room_name
      }
    }
    if (!Memory.rooms[room_name].controller) {
      Memory.rooms[room_name].controller = Game.rooms[room_name].controller
    }
    if (Game.rooms[room_name].memory) {
      Memory.rooms[room_name].tower = Game.rooms[room_name].find(FIND_MY_STRUCTURES, {filter: { structureType: STRUCTURE_TOWER }}).map(get_obj_id)
      Memory.rooms[room_name].needsRepair = get_repair_target(Game.rooms[room_name].find(FIND_STRUCTURES).map(get_obj_id))
      Memory.rooms[room_name].spawns = Game.rooms[room_name].find(FIND_MY_SPAWNS)
      Memory.rooms[room_name].has_spawn = Memory.rooms[room_name].spawns.length
      Memory.rooms[room_name].creep_counts = get_creeps(room_name)
    }
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
  if (struct_need) {
    let struct = Game.getObjectById(struct_need)
    let struct_life = (100 * most_need).toPrecision(6)
    let room_name = struct.room.name
    // console.log(room_name + '\t repair target ' + struct + '\t' + struct.pos.x + ', ' + struct.pos.y + '\t\t' + struct_life + '% - ' + struct.hits)
    console.log(`${room_name} \t repair target ${struct} \t ${struct.pos.x}, ${struct.pos.y} \t ${struct_life}% - ${struct.hits}`)
    return struct_need
  }
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
