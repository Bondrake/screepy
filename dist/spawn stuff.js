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
