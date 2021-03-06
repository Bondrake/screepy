'use strict'

var getCreepsOfRole = function (creepType, room) {
  // get creeps we care about
  if (room) {
    // we have this in memory
    let creeps = Memory.rooms[room].creep_counts[creepType]
    return creeps
  }

  let creeps = []
  for (let key in Game.creeps) {
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
          mem[creep.memory.role] = mem[creep.memory.role] || []
          mem[creep.memory.role].push(creep.name)
        // console.log(JSON.stringify(mem, null, 2))
        }
      }
    }
  }
  // console.log('object ' + this.name + ' id ' + this.id + ' attention from '); console.log(JSON.stringify(mem, null, 2))
  if (this.energyCapacity === undefined) {
    this.memory.last_attention = this.memory.attention || []
    this.memory.attention = mem
    this.say('attnmem')
  }
  //  } else {
  //    Memory.ref.sources = {}
  //    Memory.ref.sources[this.id].attention = mem
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
      let result = Game.rooms[key].find(FIND_MY_SPAWNS)
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

Creep.prototype.getExploitingRoom = function () {
  let rname = this.room.name
  let exploiter = Memory.rooms[rname].exploited_by
  if (exploiter) {
    return exploiter
  }
}

//
// ROOMPOSITION
//

RoomPosition.prototype.getDirectionAway = function (object) {
  let opposite = function (direction) {
    if (direction === TOP) return BOTTOM
    else if (direction === TOP_RIGHT) return BOTTOM_LEFT
    else if (direction === RIGHT) return LEFT
    else if (direction === BOTTOM_RIGHT) return TOP_LEFT
    else if (direction === BOTTOM) return TOP
    else if (direction === BOTTOM_LEFT) return TOP_RIGHT
    else if (direction === LEFT) return RIGHT
    else return BOTTOM_RIGHT
  }
  return opposite(this.getDirectionTo(object))
}

//
// SOURCE
//

Source.prototype.has_attention = has_attention // a

//
//  SPAWN
//
Spawn.prototype.createCreepArcher = function (name) {
  //  return this.createCreep([RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE], name, {role: 'archer'})
  return this.createCreep([RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], name, {role: 'archer'})
}
Spawn.prototype.createCreepBuilder = function (name) {
  return this.createCreep([WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE], name, {role: 'builder'})
}
Spawn.prototype.createCreepBooster = function (name) {
  return this.createCreep([WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], name, {role: 'booster'})
}
Spawn.prototype.createCreepClaimer = function (name) {
  return this.createCreep([CLAIM, CLAIM, CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE], name, {role: 'claimer'})
}
Spawn.prototype.createCreepEnershifter = function (name) {
  return this.createCreep([CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], name, {role: 'enershifter'})
}
Spawn.prototype.createCreepEnertrain = function (name) {
  return this.createCreep([CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], name, {role: 'enertrain'})
}
Spawn.prototype.createCreepFodder = function (name) {
  return this.createCreep([CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE], name, {role: 'fodder'})
}
Spawn.prototype.createCreepGuard = function (name) {
  return this.createCreep([WORK, CARRY, MOVE, MOVE], name, {role: 'guard'})
}
Spawn.prototype.createCreepHarvester = function (name) {
  return this.createCreep([WORK, CARRY, MOVE, MOVE], name, {role: 'harvester'})
}
Spawn.prototype.createCreepHealer = function (name) {
  return this.createCreep([HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], name, {role: 'healer'})
}
Spawn.prototype.createCreepLinkling = function (name) {
  return this.createCreep([CARRY, MOVE], name, {role: 'linkling'})
}
Spawn.prototype.createCreepMiner = function (name) {
  return this.createCreep([WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE], name, {role: 'miner'})
}
Spawn.prototype.createCreepMinion = function (name) {
  return this.createCreep([WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], name, {role: 'minion'})
}
Spawn.prototype.createCreepMule = function (name) {
  return this.createCreep([CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE], name, {role: 'mule'})
}
Spawn.prototype.createCreepRemoteMule = function (name) {
  return this.createCreep([WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], name, {role: 'remote_mule'})
}
Spawn.prototype.createCreepRemoteBuilder = function (name) {
  return this.createCreep([WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], name, {role: 'remote_builder'})
}
Spawn.prototype.createCreepRemoteRepairs = function (name) {
  // return this.createCreep([WORK, WORK, CARRY, CARRY, MOVE, MOVE], name, {role: 'remote_repairs'})
  return this.createCreep([WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], name, {role: 'remote_repairs'})
}
Spawn.prototype.createCreepRepairs = function (name) {
  return this.createCreep([WORK, WORK, CARRY, CARRY, MOVE, MOVE], name, {role: 'repairs'})
}
Spawn.prototype.createCreepScout = function (name) {
  return this.createCreep([WORK, CARRY, MOVE, MOVE], name, {role: 'scout'})
}
Spawn.prototype.createCreepStriker = function (name) {
  return this.createCreep([ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], name, {role: 'striker'})
//  return this.createCreep([ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], name, {role: 'striker'})
//  return this.createCreep([ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], name, {role: 'striker'})
//  return this.createCreep([RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE], name, {role: 'striker'})
}

//
// Structure
//

Structure.prototype.has_attention = has_attention // a

Structure.prototype.transmitter = function () {
  if (Memory.ref.transmitters.length) {
    for (let tx in Memory.ref.transmitters) {
      if (this.id === Memory.ref.transmitters[tx]) return true
    }
  }
  // if (this.id === '56a00e3cee7be2105ffee343') return true
  return false
}
