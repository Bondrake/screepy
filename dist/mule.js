module.exports = function (creep) {
  if (creep.carry.energy < creep.carryCapacity) {
    var sources = creep.room.find(FIND_DROPPED_RESOURCES)
    if (creep.pickup(sources[0]) === ERR_NOT_IN_RANGE) {
      creep.moveTo(sources[0])
    }
  } else {
    if (creep.transfer(Game.spawns.Enesis, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
      creep.moveTo(Game.spawns.Enesis)
    }
  }
}
