'use strict'

// var _ = require('lodash')
require('01_prototypes')
var func = require('02_helpers')
var roles = require('03_roles')

if (!Memory.ref) {
  Memory.ref = {}
  Memory.ref.time_cycle = Game.time
  Memory.ref.time_slept = 0
  Memory.ref.cycle_flip = 0
  var time_slept = 0
  var cycle_flip = 0
}

var update_time_slept = function () {
  if (Memory.ref.time_slept >= 1440) {
    Memory.ref.time_cycle = Game.time
    Memory.ref.cycle_flip ? Memory.ref.cycle_flip = 0 : Memory.ref.cycle_flip = 1
  }
  Memory.ref.time_slept = Game.time - Memory.ref.time_cycle
  time_slept = Memory.ref.time_slept
  cycle_flip = Memory.ref.cycle_flip
}

var update_creeps = function () {
  for (let name in Game.creeps) {
    let creep = Game.creeps[name]

    if (creep.memory.role === 'booster') roles.booster(creep)
    if (creep.memory.role === 'builder') roles.builder(creep)
    if (creep.memory.role === 'guard') roles.guard(creep)
    if (creep.memory.role === 'harvester') roles.harvester(creep)
    if (creep.memory.role === 'miner') roles.miner(creep)
    if (creep.memory.role === 'mule') roles.mule(creep)
  // if (creep.memory.role === 'minion')
  }
}

var update_spawns = function () {
  for (var spawn_name in Game.spawns) {
    let spawn = Game.spawns[spawn_name]
    let name_suffix = time_slept + '-' + cycle_flip
    if (spawn.room.memory.creep_counts['miner'].length === 0 && spawn.room.memory.creep_counts['harvester'].length === 0) {
      spawn.createCreepHarvester('Harvie') && console.log('Spawning initial harvester.')
    }

    if (time_slept === 0) spawn.createCreepMiner('Miner_' + name_suffix) && console.log('Spawning Miner')
    if (time_slept === 100) spawn.createCreepMule('Mule_' + name_suffix) && console.log('Spawning Mule')
    if (time_slept === 300) spawn.createCreepBooster('Booster_' + name_suffix) && console.log('Spawning Booster')
    if (time_slept === 500) spawn.createCreepMiner('Miner_' + name_suffix) && console.log('Spawning Miner')
    if (time_slept === 700) spawn.createCreepMule('Mule_' + name_suffix) && console.log('Spawning Mule')
    if (time_slept === 800) spawn.createCreepBooster('Booster_' + name_suffix) && console.log('Spawning Booster')
    if (time_slept === 1100) spawn.createCreepBooster('Booster_' + name_suffix) && console.log('Spawning Booster')
    if (time_slept === 1200) {
      if (spawn.room.find(FIND_CONSTRUCTION_SITES).typeof) spawn.createCreepBuilder('Builder_' + name_suffix) && console.log('Spawning Builder')
    }

  }
}

var update_rooms = function () {
  for (let key in Game.rooms) {
    if (Memory.rooms[key].tower[0] != null) {
      let tower = Game.getObjectById(Memory.rooms[key].tower)
      // console.log(/*'tower: ' + tower +*/ ' repairing: ' + Game.getObjectById(Memory.rooms[key].needsRepair))
      tower.repair(Game.getObjectById(Memory.rooms[key].needsRepair))
    }
  }
}

var display_stats = function () {
  if (Game.spawns.Enesis.spawning) {
    console.log(time_slept + '\t W18S3 energy is ' + Game.rooms['W18S3'].energyAvailable + '\t ' + Game.spawns.Enesis.spawning.name + ' completes in ' + Game.spawns.Enesis.spawning.remainingTime)
  } else {
    let pct = 100 * Game.rooms['W18S3'].controller.progress / Game.rooms['W18S3'].controller.progressTotal
    console.log(time_slept + '\t W18S3 energy is ' + Game.rooms['W18S3'].energyAvailable + '\t controller progress ' + Game.rooms['W18S3'].controller.progress + ' - ' + pct.toPrecision(6) + '%')
  }
}

module.exports.loop = function () {
  update_time_slept()
  if (time_slept % 10 === 0) {
    func.garbage_collect()
    func.update_model()
  }

  update_spawns()
  update_creeps()
  update_rooms()

  display_stats()
}
