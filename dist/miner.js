module.exports = function (creep) {
  if (creep.carry.energy < creep.carryCapacity) {
    var sources = creep.room.find(FIND_SOURCES)
    if (creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
      creep.moveTo(sources[0])
    // creep.say("to source!")
    }
  } else {
    creep.say('drop energy!')
    creep.dropEnergy(50)
  }
}
