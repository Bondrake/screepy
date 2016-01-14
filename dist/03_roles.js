'use strict'

function booster (creep) {
  creep.checkEmpty()
  if (creep.fillNow()) {
    var resource = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES)
    // var sources = creep.room.find(FIND_DROPPED_RESOURCES)
    if (creep.pickup(resource) === ERR_NOT_IN_RANGE) {
      creep.moveTo(resource)
    }
  } else {
    var control = creep.room.controller
    if (creep.upgradeController(control) === ERR_NOT_IN_RANGE) {
      creep.moveTo(control)
    // creep.moveTo(Game.flags.Flag1)
    }
  }
}

function builder (creep) {
  creep.checkEmpty()
  if (creep.fillNow()) {
    if (creep.room.storage && creep.room.storage.store.energy > 100) {
      var stor = creep.room.storage
      if (stor.transferEnergy(creep) === ERR_NOT_IN_RANGE)
        creep.moveTo(stor)
    } else if (creep.room.energyAvailable > 1000) {
      var spawn = creep.nearest_spawn()
      if (spawn.transferEnergy(creep) === ERR_NOT_IN_RANGE)
        creep.moveTo(spawn)
    } else {
      creep.moveTo(spawn)
    }
  } else {
    var targets = creep.room.find(FIND_CONSTRUCTION_SITES)
    if (targets.length) {
      if (creep.build(targets[0]) === ERR_NOT_IN_RANGE) creep.moveTo(targets[0])
    } else {
      creep.moveTo(Game.flags.IdleBuilders)
    }
  }
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
    var sources = creep.room.find(FIND_SOURCES)
    if (creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
      creep.moveTo(sources[0])
    }
  } else {
    var spawn = creep.nearest_spawn()
    if (creep.transferEnergy(spawn) === ERR_NOT_IN_RANGE) {
      creep.moveTo(spawn)
    }
  }
}

function miner (creep) {
  if (creep.carry.energy < creep.carryCapacity) {
    if (!creep.memory.target) {
      console.log('miner ' + creep.name + ' getting unoccupied source')
      creep.memory.target = _get_unoccupied_source(creep.room.name)
    }
    var target = Game.getObjectById(creep.memory.target)
    // console.log('miner target = ' + target)

    var harvestResult = creep.harvest(target)
    if (harvestResult < 0 && (harvestResult === ERR_BUSY || harvestResult === ERR_NOT_ENOUGH_RESOURCES || harvestResult === ERR_NOT_IN_RANGE)) {
      creep.moveTo(target)
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
      var piles = creep.room.find(FIND_DROPPED_RESOURCES)
      creep.destination(piles[0])
    // console.log('mule ' + creep.name + ' found pile ' + piles[0])
    }
    if (creep.destination()) {
      if (creep.pickup(resource) < 0) {
        var moveResult = creep.moveTo(creep.destination())
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
      creep.moveTo(Game.flags.IdleMules)
    }
  } else if (creep.fillNow()) {
    var piles = creep.room.find(FIND_DROPPED_RESOURCES)
    creep.destination(piles[0])
    if (creep.pickup(creep.destination()) === ERR_NOT_IN_RANGE) {
      creep.moveTo(creep.destination())
    }
  } else {
    var deposit_target = _get_nearest_store(creep)
    creep.destination(deposit_target)
    var transferResult = creep.transfer(deposit_target, RESOURCE_ENERGY)
    if (transferResult === ERR_NOT_IN_RANGE) {
      creep.moveTo(creep.destination())
    } else if (transferResult !== 0) {
      // console.log('mule ' + creep.name + ' transfer issue ' + transferResult)
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
// var _transmitters = function (object) {
//   return (object.structureType === STRUCTURE_LINK && object.transmitter() && (object.energy < object.energyCapacity))
// }
var _storage_other = function (object) {
  return ((object.energy < object.energyCapacity) && object.structureType !== STRUCTURE_LINK)
}
var _storage_structure = function (object) {
  return ((object.structureType === STRUCTURE_STORAGE && object.store.energy < object.storeCapacity))
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
    // creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: _transmitters}) ||
    creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: _storage_other}) ||
    creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: _storage_structure}) ||
    null
  if (no_storage && obj.structureType === STRUCTURE_STORAGE) return null
  return obj
}

var _get_unoccupied_source = function (room_name) {
  var sources = Game.rooms[room_name].find(FIND_SOURCES)
  for (var key in sources) {
    var attention = sources[key].has_attention('miner')
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
  guard: guard,
  harvester: harvester,
  miner: miner,
  mule: mule
}
