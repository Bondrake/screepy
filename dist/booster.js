module.exports = function (creep) {
  if (creep.carry.energy === 0) {
    //	if(Game.spawns.Enesis.transferEnergy(creep) == ERR_NOT_IN_RANGE) {
    //    	creep.moveTo(Game.spawns.Enesis)
    //	}
    var sources = creep.room.find(FIND_DROPPED_RESOURCES)
    if (creep.pickup(sources[0]) === ERR_NOT_IN_RANGE) {
      creep.moveTo(sources[0])
    }
  } else {
    // creep.say("upgrading")
    var control = creep.room.controller
    if (creep.upgradeController(control) === ERR_NOT_IN_RANGE) {
      creep.moveTo(control)
    // creep.moveTo(Game.flags.Flag1)
    }
  }
}
