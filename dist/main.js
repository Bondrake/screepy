'use strict'

// var _ = require('lodash')
require('01_prototypes')
var func = require('02_helpers')
var roles = require('03_roles')

if (!Memory.ref) {
  Memory.ref = {}
  Memory.ref.transmitters = ['56a00e3cee7be2105ffee343']
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
  for (let key in Game.creeps) {
    let creep = Game.creeps[key]
    //console.log('creep ' + creep + ' role ' + creep.memory.role)
    roles[creep.memory.role](creep)
  }
}

var update_spawns = function () {
  for (var spawn_name in Game.spawns) {
    let spawn = Game.spawns[spawn_name]
    let name_suffix = time_slept + '-' + cycle_flip
    if (spawn.room.memory.creep_counts['miner'].length === 0 && spawn.room.memory.creep_counts['harvester'].length === 0) {
      spawn.createCreepHarvester('Harvie') && console.log('Spawning initial harvester.')
    }

    if (spawn.name === 'Enesis') {
      if (time_slept === 0) spawn.createCreepMiner('Miner_' + name_suffix) && console.log('Spawning Miner')
      if (time_slept === 75) spawn.createCreepMule('Mule_' + name_suffix) && console.log('Spawning Mule')
      if (time_slept === 150) spawn.createCreepBooster('Booster_' + name_suffix) && console.log('Spawning Booster')
      if (time_slept === 225) spawn.createCreepMiner('Miner_' + name_suffix) && console.log('Spawning Miner')
      if (time_slept === 300) spawn.createCreepMule('Mule_' + name_suffix) && console.log('Spawning Mule')
      if (time_slept === 375) spawn.createCreepBooster('Booster_' + name_suffix) && console.log('Spawning Booster')
      if (time_slept === 450) spawn.createCreepBooster('Booster_' + name_suffix) && console.log('Spawning Booster')
      if (time_slept === 525) spawn.createCreepEnershifter('Enershifter_' + name_suffix) && console.log('Spawning Enershifter')
      if (time_slept === 600) spawn.createCreepLinkling('Linkling_' + name_suffix) && console.log('Spawning Linkling')
      if (time_slept === 675) {
        if (spawn.room.find(FIND_CONSTRUCTION_SITES).length) spawn.createCreepBuilder('Builder_' + name_suffix) && console.log('Spawning Builder')
      }
    }
  }
}

var update_rooms = function () {
  for (let key in Game.rooms) {
    if (Memory.rooms[key].tower.length) {
      for (let tower_i in Memory.rooms[key].tower) {
        let tower = Game.getObjectById(Memory.rooms[key].tower[tower_i])

        let target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
        // console.log('tower target ' + target)
        // let target = null
        // let target = Game.getObjectById('569fcbf2c17f8d4b3bc902d5')
        // let target = Game.getObjectById('569fc6618b8d3c5f3bc5dcfa')

        if (target) {
          let attack_result = tower.attack(target)
          if (attack_result < 0) {
            console.log('tower attack ' + attack_result)
          }
        } else {
          // console.log('tower: ' + tower + ' repairing: ' + Game.getObjectById(Memory.rooms[key].needsRepair))
          tower.repair(Game.getObjectById(Memory.rooms[key].needsRepair))
        }
      }
    }
  }


  let linkFrom = Game.getObjectById('56a00e3cee7be2105ffee343')
  let linkTo = Game.getObjectById('56a00c0a95e2fd290bee1e9b')
  if (linkFrom && linkTo) linkFrom.transferEnergy(linkTo);
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
