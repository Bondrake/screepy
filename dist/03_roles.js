'use strict'

function archer (creep) {
  var enemy = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
  if (enemy) {
    if (creep.pos.getRangeTo(enemy) < 3) {
      creep.move(creep.pos.getDirectionAway(enemy))
    } else if (creep.rangedAttack(enemy) === ERR_NOT_IN_RANGE) {
      creep.moveTo(enemy)
    }
  } else {
    let flag = Game.flags['Archers']
    creep.destination(flag)
    creep.moveTo(creep.destination())
  }
}

function booster (creep) {
  creep.checkEmpty()
  if (creep.fillNow()) {
    let resource = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
      filter: function (object) { return creep.pos.inRangeTo(object, 10) }})
    // var sources = creep.room.find(FIND_DROPPED_RESOURCES)
    if (creep.pickup(resource) === ERR_NOT_IN_RANGE) {
      creep.moveTo(resource)
    } else {
      if (!creep.pos.isNearTo(Game.flags.IdleBoosters)) {
        creep.moveTo(Game.flags.IdleBoosters)
      }
    }
  } else {
    let control = creep.room.controller
    if (creep.upgradeController(control) === ERR_NOT_IN_RANGE) {
      creep.moveTo(control)
    // creep.moveTo(Game.flags.Flag1)
    }
  }
}

function builder (creep) {
  creep.checkEmpty()
  if (creep.fillNow()) {
    let spawn = creep.nearest_spawn()
    let link = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
      filter: function (object) { return (object.structureType === STRUCTURE_LINK && !object.transmitter() && object.energy > 0)}})
    if (link && link.pos.getRangeTo(creep) < spawn.pos.getRangeTo(creep)) {
      if (link.transferEnergy(creep) === ERR_NOT_IN_RANGE)
        creep.moveTo(link)
    } else if (creep.room.storage && creep.room.storage.store.energy > 10000) {
      let stor = creep.room.storage
      if (stor.transferEnergy(creep) === ERR_NOT_IN_RANGE)
        creep.moveTo(stor)
    } else if (creep.room.energyAvailable > 1000) {
      if (spawn.transferEnergy(creep) === ERR_NOT_IN_RANGE)
        creep.moveTo(spawn)
    } else {
      if (!creep.pos.isNearTo(spawn)) {
        creep.moveTo(spawn)
      }
    }
  } else {
    let targets = creep.room.find(FIND_CONSTRUCTION_SITES)
    if (targets.length) {
      if (creep.build(targets[0]) === ERR_NOT_IN_RANGE) creep.moveTo(targets[0])
    } else {
      creep.moveTo(Game.flags.IdleBuilders)
    }
  }
}

function enershifter (creep) {
  creep.checkEmpty()
  if (creep.fillNow()) {
    let piles = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 8)
    if (piles.length) {
      let pile = creep.pos.findClosestByPath(piles)
      if (creep.pickup(pile) < 0) {
        let moveResult = creep.moveTo(pile)
        if (moveResult < 0 && moveResult !== ERR_BUSY && moveResult !== ERR_NO_PATH) {
          console.log(creep.name + " can't move to " + creep.destination() + ' error is ' + moveResult)
        }
      }
    } else if (creep.room.storage.store.energy > 1000) {
      var stor = creep.room.storage
      if (stor.transferEnergy(creep) === ERR_NOT_IN_RANGE) creep.moveTo(stor)
    } else {
      console.log('energy starved')
    }
  } else {
    let deposit_target = _get_nearest_store(creep)
    creep.destination(deposit_target)
    let transferResult = creep.transfer(deposit_target, RESOURCE_ENERGY)
    if (transferResult === ERR_NOT_IN_RANGE) {
      creep.moveTo(creep.destination())
    } else if (transferResult !== 0) {
      // console.log('enershifter ' + creep.name + ' transfer issue ' + transferResult)
    }
  }
}

function fodder (creep) {
  let flag = Game.flags['Stage']
  //let flag = Game.flags['FodderRush']
  //let flag = Game.flags['StageHome']
  creep.destination(flag)
  creep.moveTo(creep.destination())
}

function guard (creep) {
  var targets = creep.room.find(FIND_HOSTILE_CREEPS)
  if (targets.length) {
    if (creep.attack(targets[0]) === ERR_NOT_IN_RANGE) {
      creep.moveTo(targets[0])
    }
  }
}

function harvester (creep) {
  if (creep.carry.energy < creep.carryCapacity) {
    if (!creep.memory.target) {
      console.log('harvester ' + creep.name + ' getting unoccupied source')
      creep.memory.target = _get_unoccupied_source(creep.room.name)
    }
    let target = Game.getObjectById(creep.memory.target)
    // console.log('miner target = ' + target)

    let harvestResult = creep.harvest(target)
    if (harvestResult < 0 && (harvestResult === ERR_BUSY || harvestResult === ERR_NOT_IN_RANGE)) {
      creep.moveTo(target)
    } else if (harvestResult !== 0) {
      console.log('harvester ' + creep.name + ' unable to harvest from ' + target + ' error is ' + harvestResult)
    }
  } else {
    let spawn = creep.nearest_spawn()
    if (creep.transferEnergy(spawn) === ERR_NOT_IN_RANGE) {
      creep.moveTo(spawn)
    }
  }
}

function linkling (creep) {
  var link = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
    filter: function (object) { return (object.structureType === STRUCTURE_LINK && !object.transmitter())}})
  let spawn = creep.nearest_spawn()
  creep.checkEmpty()
  if (creep.fillNow()) {
    creep.memory.target = null
    if (link && link.pos.getRangeTo(creep) < spawn.pos.getRangeTo(creep) && link.energy > 0) {
      if (link.transferEnergy(creep) === ERR_NOT_IN_RANGE)
        creep.moveTo(link)
    } else if (creep.room.storage && creep.room.storage.store.energy > 1000) {
      let stor = creep.room.storage
      if (stor.transferEnergy(creep) === ERR_NOT_IN_RANGE)
        creep.moveTo(stor)
    } else if (creep.room.energyAvailable > 1000) {
      if (spawn.transferEnergy(creep) === ERR_NOT_IN_RANGE)
        creep.moveTo(spawn)
    } else {
      if (!creep.pos.isNearTo(spawn)) {
        creep.moveTo(spawn)
      }
    }
  } else {
    //var towers = creep.pos.findInRange(FIND_MY_STRUCTURES, 4, { filter: { structureType: STRUCTURE_TOWER } } )
    var towers = creep.room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } } )
    if (towers.length) {
      if(!creep.memory.target) {
        for (let tower of towers) {
          //if (tower.id === '56941937254d91ca66b28b27') continue
          if (tower.has_attention('linkling') < 1 && tower.energy < tower.energyCapacity - 50) {
            creep.memory.target = tower.id
            //console.log('linkling ' + creep.name + ' - attaching to tower ' + tower.id + ' - tower attenders = ' + tower.has_attention('linkling'))
            break
          }
        }
      }
      if (!creep.memory.target) creep.destination(link)
      else creep.destination(creep.memory.target)
      let transferResult = creep.transfer(creep.destination(), RESOURCE_ENERGY)
      if (transferResult === ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.destination())
      } else if (transferResult !== 0) {
        // console.log('mule ' + creep.name + ' transfer issue ' + transferResult)
      }
    }
  }
}

function miner (creep) {
  var pctFull = 100 * creep.carry.energy / creep.carryCapacity
  if (pctFull < 90) {
    if (!creep.memory.target) {
      console.log('miner ' + creep.name + ' getting unoccupied source')
      creep.memory.target = _get_unoccupied_source(creep.room.name)
    }
    let target = Game.getObjectById(creep.memory.target)
    // console.log('miner target = ' + target)

    let harvestResult = creep.harvest(target)
    if (harvestResult < 0 && (harvestResult === ERR_BUSY || harvestResult === ERR_NOT_IN_RANGE)) {
      creep.moveTo(target)
    } else if (harvestResult === ERR_NOT_ENOUGH_RESOURCES) {
      creep.dropEnergy()
    } else if (harvestResult !== 0) {
      console.log('miner ' + creep.name + ' unable to harvest from ' + target + ' error is ' + harvestResult)
    }
  } else {
    // creep.say('drop energy!')
    creep.dropEnergy()
  }
}

function mule (creep) {
  var miners = creep.room.find(FIND_MY_CREEPS, {
    filter: function (creep) {
      return creep.memory.role === 'miner'
    }
  })
  //  console.log('mule ' + creep.name + ' miners length ' + miners.length)
  var resource = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
    filter: function (object) { return creep.pos.isNearTo(object) }})
  var piles = creep.room.find(FIND_DROPPED_RESOURCES)
  // console.log('resource ' + resource)
  creep.checkEmpty()
  if (miners.length && creep.fillNow()) {
    if (!creep.memory.target) {
      for (let minern of miners) {
        // console.log(miner.has_attention('mule'))
        //        console.log('mule ' + creep.name + ' looking at miner ' + minern.name + ' with id ' + minern.id + ' attention ' + minern.has_attention('mule'))
        if (minern.has_attention('mule') < 3) {
          //            console.log('mule ' + creep.name + ' got to check 2 on miner ' + minern.name + ' with id ' + minern.id + ' attention ' + minern.has_attention('mule'))
          // if (minern.memory.target === '55c34a6c5be41a0a6e80caeb' && minern.has_attention('mule') >= 1)
          if (minern.memory.target === '55c34a6c5be41a0a6e80caeb') continue // leave more to boosters
          creep.memory.target = minern.id
          console.log('mule ' + creep.name + ' - attaching to miner ' + minern.name + ' - miner attenders = ' + minern.has_attention('mule'))
          break
        }
      }
    }
    creep.destination(creep.memory.target)
    if (!creep.memory.target) {
      creep.destination(piles[0])
    // console.log('mule ' + creep.name + ' found pile ' + piles[0])
    }
    if (creep.destination()) {
      if (creep.pickup(resource) < 0) {
        let moveResult = creep.moveTo(creep.destination())
        if (moveResult < 0 && moveResult !== ERR_BUSY && moveResult !== ERR_NO_PATH) {
          console.log(creep.name + " can't move to " + creep.destination() + ' error is ' + moveResult)
          creep.memory.target = undefined
          creep.memory.destination = undefined
        } else {
          // console.log('problem with mule ' + creep.name + ' destination is ' + creep.destination() + ' pickup result ' + creep.pickup(resource) + ' pickup target ' + resource)
        }
      }
    } else {
      creep.memory.target = undefined
      creep.memory.destination = undefined
      if (!creep.pos.isNearTo(Game.flags.IdleMules)) {
        creep.moveTo(Game.flags.IdleMules)
      }
    }
  } else if (creep.fillNow()) {
    creep.destination(piles[0])
    if (creep.pickup(creep.destination()) === ERR_NOT_IN_RANGE) {
      creep.moveTo(creep.destination())
    }
  } else {
    let deposit_target = _get_nearest_store(creep)
    creep.destination(deposit_target)
    let transferResult = creep.transfer(deposit_target, RESOURCE_ENERGY)
    if (transferResult === ERR_NOT_IN_RANGE) {
      creep.moveTo(creep.destination())
    } else if (transferResult !== 0) {
      // console.log('mule ' + creep.name + ' transfer issue ' + transferResult)
    }
  }
}

function remote_builder (creep) {
  creep.checkEmpty()
  if (creep.fillNow()) {
    if (creep.room.name === 'W18S3') {
      var spawn = creep.nearest_spawn()
      spawn.transferEnergy(creep)
    } else {
      if (!creep.memory.target) {
        console.log('remote_builder ' + creep.name + ' getting unoccupied source')
        creep.memory.target = _get_unoccupied_source(creep.room.name)
      }
      let target = Game.getObjectById(creep.memory.target)
      // console.log('miner target = ' + target)

      let harvestResult = creep.harvest(target)
      if (harvestResult < 0 && (harvestResult === ERR_BUSY || harvestResult === ERR_NOT_IN_RANGE)) {
        creep.moveTo(target)
      } else if (harvestResult === ERR_NOT_ENOUGH_RESOURCES) {
        creep.dropEnergy()
      } else if (harvestResult !== 0) {
        console.log('remote_builder ' + creep.name + ' unable to harvest from ' + target + ' error is ' + harvestResult)
      }
    }
  } else {
    if (creep.room.name !== 'W18S2') {
      creep.moveTo(Game.flags['Stage'])
    } else {
      let targets = creep.room.find(FIND_CONSTRUCTION_SITES)
      if (targets.length) {
        if (creep.build(targets[0]) === ERR_NOT_IN_RANGE) creep.moveTo(targets[0])
      } else {
        creep.moveTo(Game.flags.IdleBuilders)
      }
    }
  }
}

function scout (creep) {
  if (!creep.destination()) {
    // dont double up scouts
    var scouts = Memory.rooms['W18S3'].creep_counts['scout']
    if (scouts.length) {
      var other_scouts = []
      for (let scout of scouts) {
        console.log(scout)
        if (this.name !== scouts[scout]) {
          other_scouts.push(Game.getObjectById(scouts[scout]).destination())
        }
      }
    }
    // GET ROOMS TAGGED FOR SCOUTING
    let flag = Game.flags['Enew']
      // if there are no friendly units in that room get flag as target
    if (!Game.rooms[flag.pos.roomName]) {
      // if no other scouts own that room
      if (!other_scouts) {
        creep.say('no other scouts')
        creep.destination(flag)
      } else if (other_scouts.indexOf(flag.id) == -1) {
        creep.destination(flag)
      }
    }
  } else {
    creep.moveTo(creep.destination())
  }
}

function striker (creep) {
  //var tower = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } } )
  //var tower = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES)
  //var tower = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES)
  //var tower = creep.pos.findClosestByRange(FIND_STRUCTURES)
  var tower = null
  //console.log(tower)
  if (creep.pos.isNearTo(creep.room.controller)) {
    //let result = creep.claimController(creep.room.controller)
    //console.log('claim controller ' + result)
  }
  if (tower) {
    let attack_result = creep.attack(tower)
    if (attack_result === ERR_NOT_IN_RANGE) {
      creep.moveTo(tower)
    } else {
      creep.moveTo(tower)
      console.log(attack_result)
    }
  } else {
    let target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
    //if (creep.name === 'Strike1') target = Game.getObjectById('567d3dfa3ce4857d1df37f55')
    //let target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES)
    //let target = null
    //let target = Game.getObjectById('569fc6618b8d3c5f3bc5dcfa')
    //console.log('striker target ' + target)
    if (target) {
      if (creep.attack(target) === ERR_NOT_IN_RANGE) {
        creep.moveTo(target)
      }
    } else {
      //let flag = Game.flags['StrikeStage']
      let flag = Game.flags['Strike']
      creep.destination(flag)
      creep.moveTo(creep.destination())
    }
  }
}

//  Filters for find operations
// var _stored_energy = function (object) {
//   return ((object.energy > 10) || (object.structureType === STRUCTURE_STORAGE && object.store.energy > 10))
// }
var _storage_spawn_extension = function (object) {
  return ((object.energy < object.energyCapacity) && (object.structureType === STRUCTURE_EXTENSION || object.structureType === STRUCTURE_SPAWN))
}
var _transmitters = function (object) {
   return (object.structureType === STRUCTURE_LINK && object.transmitter() && object.energy < object.energyCapacity)
}
var _storage_other = function (object) {
  return ((object.energy < object.energyCapacity - 50) && object.structureType !== STRUCTURE_LINK)
}
var _storage_structure = function (object) {
  return (object.structureType === STRUCTURE_STORAGE && object.store.energy < object.storeCapacity - 50)
}
var _storage_struct = function (object) {
  return (object.structureType === STRUCTURE_STORAGE)
}
var _needs_repair = function (object) {
  return ((object.structureType !== STRUCTURE_WALL && object.structureType !== STRUCTURE_RAMPART && (object.hits < object.hitsMax)) ||
  (object.structureType === STRUCTURE_RAMPART && (object.hits < Memory.rooms[object.room.name].wallHP)) ||
  (object.structureType === STRUCTURE_WALL && (object.hits < Memory.rooms[object.room.name].wallHP))
  )
}

var _get_nearest_store = function (creep, no_storage) {
  var obj = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: _storage_spawn_extension}) ||
    creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: _transmitters}) ||
    creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: _storage_other}) ||
    creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: _storage_structure}) ||
    null
  if (no_storage && obj.structureType === STRUCTURE_STORAGE) return null
  return obj
}

var _get_unoccupied_source = function (room_name) {
  var sources = Game.rooms[room_name].find(FIND_SOURCES)
  for (let key in sources) {
    let attention = sources[key].has_attention('miner')
    console.log('source ' + sources[key].id + ' attention level of source: ' + attention)
    if (!attention) {
      return sources[key].id
    } else if (sources[key].id === '55c34a6c5be41a0a6e80caec' && attention < 3) { // W18S3 3 man source
      return sources[key].id
    }
  }
}

module.exports = {
  booster: booster,
  builder: builder,
  enershifter: enershifter,
  fodder: fodder,
  guard: guard,
  harvester: harvester,
  linkling: linkling,
  miner: miner,
  mule: mule,
  remote_builder: remote_builder,
  scout: scout,
  striker: striker
}
