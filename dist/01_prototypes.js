'use strict'

var getCreepsOfRole = function (creepType, room) {
  // get creeps we care about
  if (room) {
    // we have this in memory
    var creeps = Memory.rooms[room].creep_counts[creepType]
    return creeps
  }

  var creeps = []
  for (key in Game.creeps) {
    if (Game.creeps[key].memory.role === creepType) {
      creeps.push(Game.creeps[key].id)
    }
  }
  return creeps
}

var has_attention = function (creepType, global) {
  var attendants = 0
  var mem = {}
  if (!global) var room = this.room.name
  var creeps = getCreepsOfRole(creepType, room)

  // how many of them have this as their target
  if (creeps) {
    for (var key in creeps) {
      var creep = Game.getObjectById(creeps[key])
      if (creep) {
        if (creep.memory.target === this.id && creep.ticksToLive > 100) {
          attendants += 1
          // console.log('creepType ' + creepType + ' creep.memory.role ' + creep.memory.role + ' creep.memory.name ' + creep.name)
          mem[creep.memory.role] = creep.name
          // console.log(JSON.stringify(mem, null, 2))
        }
      }
    }
  }
  // console.log('object ' + this.name + ' id ' + this.id + ' attention from '); console.log(JSON.stringify(mem, null, 2))
  if (this.energyCapacity === undefined) {
    this.memory.attention = mem
  //  } else {
  //    Memory.ref.sources = {}
  //    Memory.ref.sources[this.id].attention = mem
  }
  return attendants
}

//
//  CREEP
//

Creep.prototype.has_attention = has_attention //

Creep.prototype.checkEmpty = function () {
  if (this.carry.energy === 0) {
    this.memory.fillingUp = 'yes'
  }
}

Creep.prototype.fillNow = function () {
  if (this.carry.energy < this.carryCapacity && this.memory.fillingUp === 'yes') {
    return true
  } else {
    this.memory.fillingUp = 'no'
    return false
  }
}

Creep.prototype.nearest_spawn = function () {
  var spawn = this.pos.findClosestByRange(FIND_MY_SPAWNS)
  // no spawn in this room?
  if (!spawn) {
    for (var key in Game.rooms) {
      result = Game.rooms[key].find(FIND_MY_SPAWNS)
      if (result) {
        return result[0]
      }
    }
  }
  return spawn
}

Creep.prototype.destination = function (destination) {
  this.memory.destinationName = undefined
  if (destination) this.memory.destination = (destination.id) ? destination.id : destination
  var dest = Game.getObjectById(this.memory.destination)
  if (dest) {
    if (dest.name) this.memory.destinationName = dest.name
  }
  return (dest) ? dest : undefined
}

Creep.prototype.mem_move = function () {
  var dest = Game.getObjectById(this.destination())
  if (dest && !this.pos.isNearTo(dest)) {
    // use creep.memory.priority_route in urgent situations like battles.
    if (!this.memory.path || this.memory.last_route >= this.memory.next_route || !this.memory.next_route || this.memory.priority_route) {
      this.memory.last_route = 0

      this.memory.path = this.pos.findPathTo(dest, {maxOps: 200})
      // try harder
      if (!this.memory.path.length) {
        this.memory.path = this.pos.findPathTo(dest, {maxOps: 200, ignoreCreeps: true})
        this.say(this.memory.path.length)
      }
      this.memory.next_route = Math.max(Math.ceil(this.memory.path.length * (3 / 4)), 5)
    }
  } else {
    this.memory.path = null
  }

  if (this.memory.path) {
    this.memory.last_route += 1
    this.moveByPath(this.memory.path)
  }
}

Creep.prototype.target = function (target) {
  this.memory.targetName = undefined
  if (target) this.memory.target = (target.id) ? target.id : target
  var tar = Game.getObjectById(this.memory.target)
  if (tar.name) this.memory.targetName = tar.name
  return (tar) ? tar : undefined
}

//
// SOURCE
//

Source.prototype.has_attention = has_attention

//
//  SPAWN
//

Spawn.prototype.createCreepBuilder = function (name) {
  return this.createCreep([WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], name, {role: 'builder'})
}

Spawn.prototype.createCreepBooster = function (name) {
  return this.createCreep([WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE], name, {role: 'booster'})
}

Spawn.prototype.createCreepGuard = function (name) {
  return this.createCreep([WORK, CARRY, MOVE, MOVE], name, {role: 'guard'})
}

Spawn.prototype.createCreepHarvester = function (name) {
  return this.createCreep([WORK, CARRY, MOVE], name, {role: 'harvester'})
}

Spawn.prototype.createCreepMiner = function (name) {
  return this.createCreep([WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE], name, {role: 'miner'})
}

Spawn.prototype.createCreepMinion = function (name) {
  return this.createCreep([WORK, CARRY, MOVE, MOVE], name, {role: 'minion'})
}

Spawn.prototype.createCreepMule = function (name) {
  return this.createCreep([CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE], name, {role: 'mule'})
}

//
// Structure
//

// Structure.prototype.has_attention = has_attention
