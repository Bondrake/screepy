//
//  CREEP
//

Creep.prototype.destination = function (destination) {
  if (destination) this.memory.destination = (destination.id) ? destination.id : destination
  return this.memory.destination
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

//
//  SPAWN
//

Spawn.prototype.createCreepBuilder = function (name) {
  return this.createCreep([WORK, CARRY, MOVE, MOVE], name, {role: 'builder'})
}

Spawn.prototype.createCreepBooster = function (name) {
  return this.createCreep([WORK, CARRY, MOVE, MOVE], name, {role: 'booster'})
}

Spawn.prototype.createCreepGuard = function (name) {
  return this.createCreep([WORK, CARRY, MOVE, MOVE], name, {role: 'guard'})
}

Spawn.prototype.createCreepHarvester = function (name) {
  return this.createCreep([WORK, CARRY, MOVE], name, {role: 'harvester'})
}

Spawn.prototype.createCreepMiner = function (name) {
  return this.createCreep([WORK, WORK, CARRY, MOVE], name, {role: 'miner'})
}

Spawn.prototype.createCreepMinion = function (name) {
  return this.createCreep([WORK, CARRY, MOVE, MOVE], name, {role: 'minion'})
}

Spawn.prototype.createCreepMule = function (name) {
  return this.createCreep([CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], name, {role: 'mule'})
}
