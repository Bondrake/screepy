module.exports = function (creep) {
  if (creep.carry.energy === 0) {
    if (Game.spawns.Enesis.transferEnergy(creep) === ERR_NOT_IN_RANGE) {
      creep.moveTo(Game.spawns.Enesis)
    }
  //		var sources = creep.room.find(FIND_DROPPED_RESOURCES)
  //		if(creep.pickup(sources[0]) == ERR_NOT_IN_RANGE) {
  //			creep.moveTo(sources[0])
  //		}
  } else {
    var targets = creep.room.find(FIND_CONSTRUCTION_SITES)
    if (targets.length) {
      if (creep.build(targets[0]) === ERR_NOT_IN_RANGE) {
        creep.moveTo(targets[0])
      }
    } else {
      creep.moveTo(Game.flags.IdleBuilders)
    }
  }
}
