// updated pw

var _ = require('lodash')

var mod = require('spawn stuff')

var booster = require('booster')
var builder = require('builder')
var guard = require('guard')
var harvester = require('harvester')
var miner = require('miner')
var mule = require('mule')

module.exports.loop = function () {
  for (var name in Game.creeps) {
    var creep = Game.creeps[name]
    var roomName = creep.room.name

    if (creep.memory.role === 'booster') {
      booster(creep)
    }

    if (creep.memory.role === 'builder') {
      // builder(creep)
      // miner(creep)
      // mule(creep)
    }


    if (creep.memory.role === 'guard') {
      guard(creep)
    }

    if (creep.memory.role === 'miner') {
      miner(creep)
    }

    if (creep.memory.role === 'mule') {
      mule(creep)
    }

    if (creep.memory.role === 'harvester') {
      harvester(creep)
    }

    if (creep.memory.role === 'minion') {
    }
  }
}
