'use strict'
// Game.spawns.Enesis.createCreep([WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 'BigBuild1', {role: 'remote_builder'})
// Game.spawns.Enesis.createCreep([MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK], 'BigStrike7', {role: 'striker'})

// var _ = require('lodash')
var profiler = require('x_profiler')
require('01_prototypes')
var func = require('02_helpers')
var roles = require('03_roles')

if (!Memory.ref) {
  Memory.ref = {
    sources: {},
    time_cycle: Game.time,
    time_slept: 0,
    cycle_flip: 0
  }
  var time_slept = 0
  var cycle_flip = 0
}

Memory.ref.transmitters = ['56a00e3cee7be2105ffee343', '56ac79eddf60560f66673a72', '56b01ddbe655a9fc3e1bf31a', '56b2b309add5caf73e798ee0', '56c3fadf71fbff3e39d41997', '56c41bb31cfaf52b0e41f5ac']
Memory.rooms['W18S3'].exploits = ['W17S3', 'W19S3']
Memory.rooms['W16S2'].exploits = ['W15S2', 'W16S3']
// Memory.rooms['W19S4'].exploits = ['W18S4', 'W17S4']
for (let exploiter in Memory.rooms) {
  if (Memory.rooms[exploiter].exploits) {
    for (let exploited of Memory.rooms[exploiter].exploits) {
      Memory.rooms[exploited].exploited_by = exploiter
    }
  }
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
    // console.log(`update creeps - key = ${key} - creep = ${creep} - role = ${creep.memory.role}`)
    roles[creep.memory.role](creep)
  }
}

var update_spawns = function () {
  for (var spawn_name in Game.spawns) {
    let spawn = Game.spawns[spawn_name]
    let name_suffix = spawn.room.name + '-' + time_slept + '-' + cycle_flip
    if (spawn.room.memory.creep_counts['miner'].length === 0 && spawn.room.memory.creep_counts['harvester'].length === 0) {
      // spawn.createCreepHarvester('Harvie') && console.log('Spawning initial harvester.')
    }

    if (spawn.name === 'Enesis') {
      if (time_slept === 0) spawn.createCreepMiner('Miner_' + name_suffix) && console.log('Spawning Miner')
      if (time_slept === 75) spawn.createCreepMule('Mule_' + name_suffix) && console.log('Spawning Mule')
      if (time_slept === 150) spawn.createCreepMiner('Miner_' + name_suffix) && console.log('Spawning Miner')
      if (time_slept === 225) spawn.createCreepMule('Mule_' + name_suffix) && console.log('Spawning Mule')
      if (time_slept === 300) spawn.createCreep([WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE], 'Booster_' + name_suffix, {role: 'booster'}) && console.log('Spawning Booster')
      // if (time_slept === 375) spawn.createCreep([WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE], 'Booster_' + name_suffix, {role: 'booster'}) && console.log('Spawning Booster')
      if (time_slept === 450) spawn.createCreepEnershifter('Enershifter_' + name_suffix) && console.log('Spawning Enershifter')
      if (time_slept === 525) spawn.createCreepLinkling('Linkling_' + name_suffix) && console.log('Spawning Linkling')
      if (time_slept === 600) {
        if (spawn.room.find(FIND_CONSTRUCTION_SITES).length) spawn.createCreepBuilder('Builder_' + name_suffix) && console.log('Spawning Builder')
      }
    }
    if (spawn.name === 'Enesis' && Memory.rooms[spawn.room.name].strikeStage && time_slept > 550) {
      for (let i = 0; i < Memory.rooms[spawn.room.name].strikeSize; i++) {
        let creep_name = 'StrikerX_' + spawn.room.name + '-' + i
        // let creep_name = 'RemoteBuilder_' + spawn.room.name + '-' + i
        if (!Game.creeps[creep_name] && spawn.canCreateCreep([ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]) === OK) {
          // spawn.createCreepStriker(creep_name)
          // Game.spawns.Enesis.createCreepRemoteBuilder(creep_name)
          Game.spawns.Enesis.createCreep([ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK], creep_name, {role: 'striker'})
        }
      }
    }
    if (spawn.name === 'Enesis2') {
      if (time_slept === 50) spawn.createCreepMiner('Miner_' + name_suffix) && console.log('Spawning Miner')
      if (time_slept === 150) spawn.createCreepRemoteMule('RemoteMule_' + name_suffix) && console.log('Spawning RemoteMule')
      if (time_slept === 250) spawn.createCreepRemoteMule('RemoteMule_' + name_suffix) && console.log('Spawning RemoteMule')
      if (time_slept === 350) spawn.createCreepMiner('Miner_' + name_suffix) && console.log('Spawning Miner')
      if (time_slept === 450) spawn.createCreepRemoteMule('RemoteMule_' + name_suffix) && console.log('Spawning RemoteMule')
      if (time_slept === 550) spawn.createCreepRemoteMule('RemoteMule_' + name_suffix) && console.log('Spawning RemoteMule')
      if (time_slept === 650) spawn.createCreepMiner('Miner_' + name_suffix) && console.log('Spawning Miner')
      if (time_slept === 750) spawn.createCreepRemoteMule('RemoteMule_' + name_suffix) && console.log('Spawning RemoteMule')
      if (time_slept === 850) spawn.createCreepRemoteMule('RemoteMule_' + name_suffix) && console.log('Spawning RemoteMule')
      if (time_slept === 950) spawn.createCreepRemoteMule('RemoteMule_' + name_suffix) && console.log('Spawning RemoteMule')
    }
    if (spawn.name === 'Enesis2' && Memory.rooms[spawn.room.name].strikeStage && time_slept > 1000) {
      for (let i = 0; i < Memory.rooms[spawn.room.name].strikeSize; i++) {
        let creep_name = 'Striker_' + spawn.room.name + '-' + i
        // let creep_name = 'RemoteBuilder_' + spawn.room.name + '-' + i
        if (!Game.creeps[creep_name] && spawn.canCreateCreep([ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]) === OK) {
          // spawn.createCreepStriker(creep_name)
          Game.spawns.Enesis2.createCreep([ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK], creep_name, {role: 'striker'})
          // Game.spawns.Enesis.createCreepRemoteBuilder(creep_name)
        }
      }
    }
    if (spawn.name === 'Enesis3') {
      if (time_slept === 0) spawn.createCreepClaimer('Claimer_' + name_suffix) && console.log('Spawning Claimer')
      if (time_slept === 100) spawn.createCreepClaimer('Claimer_' + name_suffix) && console.log('Spawning Claimer')
      if (time_slept === 700) spawn.createCreepClaimer('Claimer_' + name_suffix) && console.log('Spawning Claimer')
      if (time_slept === 800) spawn.createCreepClaimer('Claimer_' + name_suffix) && console.log('Spawning Claimer')
    }
    // if (spawn.name === 'Enesis3' && Memory.rooms[spawn.room.name].strikeStage) {
      // for (let i = 0; i < Memory.rooms[spawn.room.name].strikeSize; i++) {
    // if (spawn.name === 'Enesis3' && time_slept > 100) {
    //   for (let i = 0; i < 2; i++) {
        // let creep_name = 'StrikerY_' + spawn.room.name + '-' + i
    //     let creep_name = 'RemoteBuilder_' + spawn.room.name + '-' + i
        // if (!Game.creeps[creep_name] && spawn.canCreateCreep([ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]) === OK) {
    //     if (!Game.creeps[creep_name]) {
          // spawn.createCreepStriker(creep_name)
          // Game.spawns.Enesis3.createCreep([ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK, MOVE, ATTACK], creep_name, {role: 'striker'})
          // Game.spawns.Enesis3.createCreepRemoteBuilder(creep_name)
    //       Game.spawns.Enesis3.createCreep([WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], creep_name, {role: 'remote_builder'})
    //     }
    //   }
    // }

    if (spawn.name === 'Entwo') {
      if (time_slept === 0) spawn.createCreepMiner('Miner_' + name_suffix) && console.log('Spawning Miner')
      if (time_slept === 75) spawn.createCreepMule('Mule_' + name_suffix) && console.log('Spawning Mule')
      if (time_slept === 150) spawn.createCreepMiner('Miner_' + name_suffix) && console.log('Spawning Miner')
      if (time_slept === 225) spawn.createCreepMule('Mule_' + name_suffix) && console.log('Spawning Mule')
      if (time_slept === 300) spawn.createCreep([WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE], 'Booster_' + name_suffix, {role: 'booster'}) && console.log('Spawning Booster')
      // if (time_slept === 375) spawn.createCreep([WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE], 'Booster_' + name_suffix, {role: 'booster'}) && console.log('Spawning Booster')
      // if (time_slept === 450) spawn.createCreepEnershifter('Enershifter_' + name_suffix) && console.log('Spawning Enershifter')
      // if (time_slept === 525) spawn.createCreepMiner('Miner_' + name_suffix) && console.log('Spawning Miner')
      // if (time_slept === 600) spawn.createCreep([WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE], 'RemoteMule_' + name_suffix, {role: 'remote_mule'}) && console.log('Spawning Remote Mule')
      // if (time_slept === 675) spawn.createCreep([WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE], 'RemoteMule_' + name_suffix, {role: 'remote_mule'}) && console.log('Spawning Remote Mule')
      // if (time_slept === 750) spawn.createCreepMiner('Miner_' + name_suffix) && console.log('Spawning Miner')
      // if (time_slept === 825) spawn.createCreep([WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE], 'RemoteMule_' + name_suffix, {role: 'remote_mule'}) && console.log('Spawning Remote Mule')
      // if (time_slept === 900) spawn.createCreep([WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE], 'RemoteMule_' + name_suffix, {role: 'remote_mule'}) && console.log('Spawning Remote Mule')
      // if (time_slept === 975) spawn.createCreep([WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE], 'RemoteMule_' + name_suffix, {role: 'remote_mule'}) && console.log('Spawning Remote Mule')
      // if (time_slept === 375) spawn.createCreep([WORK, CARRY, CARRY, MOVE], 'Booster_' + name_suffix, {role: 'booster'}) && console.log('Spawning Booster')
      // if (time_slept === 450) spawn.createCreep([WORK, CARRY, CARRY, MOVE], 'Booster_' + name_suffix, {role: 'booster'}) && console.log('Spawning Booster')
      // if (time_slept === 525) spawn.createCreepEnershifter('Enershifter_' + name_suffix) && console.log('Spawning Enershifter')
      // if (time_slept === 600) spawn.createCreepLinkling('Linkling_' + name_suffix) && console.log('Spawning Linkling')
      if (time_slept === 550) {
        if (spawn.room.find(FIND_CONSTRUCTION_SITES).length) spawn.createCreep([WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], 'Builder_' + name_suffix, {role: 'builder'}) && console.log('Spawning Builder')
      }
    }

    if (spawn.name === 'Entree') {
      if (time_slept === 0) spawn.createCreepMiner('Miner_' + name_suffix) && console.log('Spawning Miner')
      if (time_slept === 75) spawn.createCreepMule('Mule_' + name_suffix) && console.log('Spawning Mule')
      if (time_slept === 150) spawn.createCreepMiner('Miner_' + name_suffix) && console.log('Spawning Miner')
      if (time_slept === 225) spawn.createCreepMule('Mule_' + name_suffix) && console.log('Spawning Mule')
      if (time_slept === 300) spawn.createCreep([WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE], 'Booster_' + name_suffix, {role: 'booster'}) && console.log('Spawning Booster')
      // if (time_slept === 375) spawn.createCreep([WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE], 'Booster_' + name_suffix, {role: 'booster'}) && console.log('Spawning Booster')
      if (time_slept === 375) spawn.createCreepEnershifter('Enershifter_' + name_suffix) && console.log('Spawning Enershifter')
      // if (time_slept === 375) spawn.createCreepRepairs('Repairs_' + name_suffix) && console.log('Spawning Repairs')
      if (time_slept === 450) spawn.createCreepMiner('Miner_' + name_suffix) && console.log('Spawning Miner')
      if (time_slept === 525) spawn.createCreepMule('Mule_' + name_suffix) && console.log('Spawning Mule')
      if (time_slept === 600) spawn.createCreepMule('Mule_' + name_suffix) && console.log('Spawning Mule')
      if (time_slept === 675) spawn.createCreepMiner('Miner_' + name_suffix) && console.log('Spawning Miner')
      if (time_slept === 750) spawn.createCreepMule('Mule_' + name_suffix) && console.log('Spawning Mule')
      if (time_slept === 825) spawn.createCreepMule('Mule_' + name_suffix) && console.log('Spawning Mule')
      if (time_slept === 900) {
        if (spawn.room.find(FIND_CONSTRUCTION_SITES).length) spawn.createCreep([WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE], 'Builder_' + name_suffix, {role: 'builder'}) && console.log('Spawning Builder')
      }
    }
  }
}

var update_rooms = function () {
  for (let key in Game.rooms) {
    if (Memory.rooms[key].tower && Memory.rooms[key].tower.length) {
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
    var _transmitters = function (object) { return (object.structureType === STRUCTURE_LINK && object.transmitter() && object.energy > 0) }
    var _receivers = function (object) { return (object.structureType === STRUCTURE_LINK && !object.transmitter() && object.energy < object.energyCapacity) }
    var _most_depleted_receiver = function () {
      let rx_energies = {}
      let rx_links = Game.rooms[key].find(FIND_MY_STRUCTURES, { filter: _receivers })
      for (let key in rx_links) { rx_energies[rx_links[key].id] = rx_links[key].energy }
      let emptiest = Object.keys(rx_energies).sort(function (a, b) { return rx_energies[a] - rx_energies[b] })
      return Game.getObjectById(emptiest[0])
    }
    let tx_links = Game.rooms[key].find(FIND_MY_STRUCTURES, { filter: _transmitters })
    for (let tx of tx_links) {
      let rx = _most_depleted_receiver()
      tx.transferEnergy(rx)
    }
  }
}

var display_stats = function () {
  let spawn_text = ''
  for (var spawn_name in Game.spawns) {
    let spawn = Game.spawns[spawn_name]
    if (spawn.spawning) {
      let spawn_s = '\t ' + spawn.spawning.name + ' in ' + spawn.spawning.remainingTime + ' room ' + spawn.room.name
      spawn_text = spawn_text.concat(spawn_s)
    }
  }
  if (spawn_text !== '') console.log('spawning:' + spawn_text)
  for (let room_name in Game.rooms) {
    if (Memory.rooms[room_name].controller && Memory.rooms[room_name].controller.level > 0 && Memory.rooms[room_name].controller.level < 8) {
      let pct = (100 * Game.rooms[room_name].controller.progress / Game.rooms[room_name].controller.progressTotal).toPrecision(6)
      console.log(`${time_slept} \t ${room_name} energy is ${Game.rooms[room_name].energyAvailable} \t controller progress ${pct}%`)
    } else if (Memory.rooms[room_name].controller && Memory.rooms[room_name].controller.level > 0) {
      console.log(`${time_slept} \t ${room_name} energy is ${Game.rooms[room_name].energyAvailable}`)
    }
  }
}

profiler.enable()

module.exports.loop = function () {
  profiler.wrap(function () {
    update_time_slept()
    if (time_slept % 10 === 0) {
      func.garbage_collect()
      func.update_model()
    }

    // var get_obj_id = function (obj) {
    //   return (obj.id) ? obj.id : null
    // }
    //  for (var key in Memory.rooms) {
    //    for (let source of Memory.rooms[key].sources) {
    //      Memory.ref.sources[source] = key
    //    }
    //  }

    update_spawns()
    update_creeps()
    update_rooms()

    display_stats()
  })
}
