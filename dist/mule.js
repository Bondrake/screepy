// Filters for find operations
var stored_energy = function (object) {
  return ((object.energy > 10) || (object.structureType === STRUCTURE_STORAGE && object.store.energy > 10))
}
var storage_spawn_extension = function (object) {
  return ((object.energy < object.energyCapacity) && (object.structureType === STRUCTURE_EXTENSION || object.structureType === STRUCTURE_SPAWN))
}
var transmitters = function (object) {
  return (object.structureType === STRUCTURE_LINK && object.transmitter() && (object.energy < object.energyCapacity))
}
var storage_other = function (object) {
  return ((object.energy < object.energyCapacity) && object.structureType !== STRUCTURE_LINK)
}
var storage_structure = function (object) {
  return ((object.structureType === STRUCTURE_STORAGE && object.store.energy < object.storeCapacity))
}
var storage_struct = function (object) {
  return (object.structureType === STRUCTURE_STORAGE)
}
var needs_repair = function (object) {
  return ((object.structureType !== STRUCTURE_WALL && object.structureType !== STRUCTURE_RAMPART && (object.hits < object.hitsMax)) ||
  (object.structureType === STRUCTURE_RAMPART && (object.hits < Memory.rooms[object.room.name].wallHP)) ||
  (object.structureType === STRUCTURE_WALL && (object.hits < Memory.rooms[object.room.name].wallHP))
  )
}

var get_nearest_store = function (creep, no_storage) {
  var obj = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: storage_spawn_extension}) ||
    //creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: transmitters}) ||
    creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: storage_other}) ||
    creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: storage_structure}) ||
    null
  if (no_storage && obj.structureType == STRUCTURE_STORAGE) return null
  return obj
}

module.exports = function (creep) {
  if (creep.carry.energy < creep.carryCapacity) {
    var sources = creep.room.find(FIND_DROPPED_RESOURCES)
    if (creep.pickup(sources[0]) === ERR_NOT_IN_RANGE) {
      creep.moveTo(sources[0])
    }
  } else {
    var deposit_target = get_nearest_store(creep)
    creep.destination(deposit_target)
    if (creep.transfer(deposit_target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
      creep.moveTo(deposit_target)
    }
  }
}
