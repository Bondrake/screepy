var _ = require('lodash')

var req_prototypes = require('01_prototypes')

var booster = require('booster')
var builder = require('builder')
var guard = require('guard')
var harvester = require('harvester')
var miner = require('miner')
var mule = require('mule')

if (!Memory.ref) {
  Memory.ref = {}
  Memory.ref.time_cycle = Game.time
  Memory.ref.time_slept = 0
}

module.exports.loop = function () {
  if (Memory.ref.time_slept === 1550) {
    Memory.ref.time_cycle = Game.time
  }
  Memory.ref.time_slept = Game.time - Memory.ref.time_cycle
  var time_slept = Memory.ref.time_slept
  console.log(time_slept)

  if (time_slept === 0) {
    Game.spawns.Enesis.createCreepMiner('Miner000')
    console.log('Spawning Miner000')
  }
  if (time_slept === 100) {
    Game.spawns.Enesis.createCreepMule('Mule100')
  }
  if (time_slept === 200) {
    Game.spawns.Enesis.createCreepBuilder('Builder200')
  }
  if (time_slept === 300) {
    Game.spawns.Enesis.createCreepBooster('Booster300')
  }

//  if (time_slept === 750) {
//    Game.spawns.Enesis.createCreepMiner('Miner750')
//  }
  if (time_slept === 850) {
    Game.spawns.Enesis.createCreepMule('Mule850')
  }
//  if (time_slept === 950) {
//    Game.spawns.Enesis.createCreepBuilder('Builder950')
//  }
//  if (time_slept === 1050) {
//    Game.spawns.Enesis.createCreepBooster('Booster1050')
//  }

  for (var name in Game.creeps) {
    var creep = Game.creeps[name]
    //    var roomName = creep.room.name

    if (creep.memory.role === 'booster') {
      booster(creep)
    }

    if (creep.memory.role === 'builder') {
      builder(creep)
      // miner(creep)
      // mule(creep)
    }

    if (creep.memory.role === 'guard') {
      guard(creep)
    }

    if (creep.memory.role === 'harvester') {
      harvester(creep)
    }

    if (creep.memory.role === 'miner') {
      miner(creep)
    }

    if (creep.memory.role === 'mule') {
      mule(creep)
    }

    if (creep.memory.role === 'minion') {
    }
  }
}
