'use strict'

/*
 █████  ██████   ██████ ██   ██ ███████ ██████
██   ██ ██   ██ ██      ██   ██ ██      ██   ██
███████ ██████  ██      ███████ █████   ██████
██   ██ ██   ██ ██      ██   ██ ██      ██   ██
██   ██ ██   ██  ██████ ██   ██ ███████ ██   ██
*/
function archer (creep) {
  var enemy = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
  if (enemy) {
    if (creep.pos.getRangeTo(enemy) < 3) {
      creep.move(creep.pos.getDirectionAway(enemy))
      return
    } else if (creep.rangedAttack(enemy) === ERR_NOT_IN_RANGE) {
      creep.moveTo(enemy)
      return
    }
  } else {
    let flag = Game.flags['Archers']
    creep.destination(flag)
    creep.moveTo(creep.destination())
    return
  }
}

/*
██████   ██████   ██████  ███████ ████████ ███████ ██████
██   ██ ██    ██ ██    ██ ██         ██    ██      ██   ██
██████  ██    ██ ██    ██ ███████    ██    █████   ██████
██   ██ ██    ██ ██    ██      ██    ██    ██      ██   ██
██████   ██████   ██████  ███████    ██    ███████ ██   ██
*/
function booster (creep) {
  creep.checkEmpty()
  if (creep.fillNow()) {
    let stor = creep.room.storage
    // console.log(stor)
    if (stor && stor.store.energy > 10000 && creep.pos.inRangeTo(stor, 4)) {
      if (creep.pos.isNearTo(stor)) stor.transferEnergy(creep)
      creep.moveTo(stor)
      return
    }
    let resource = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES)
    // let resource = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
    //  filter: function (object) { return creep.pos.inRangeTo(object, 10) }})
    // var sources = creep.room.find(FIND_DROPPED_RESOURCES)
    let link = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
      filter: function (object) { return (object.structureType === STRUCTURE_LINK && !object.transmitter()) }})
    if (link && creep.pos.inRangeTo(link, 3) && link.energy > 0) {
      if (link.transferEnergy(creep) === ERR_NOT_IN_RANGE) creep.moveTo(link)
      return
    } else if (!link && creep.pickup(resource) === ERR_NOT_IN_RANGE) {
      creep.moveTo(resource)
      return
    } else {
      if (!creep.pos.isNearTo(Game.flags.IdleBoosters)) {
        creep.moveTo(Game.flags.IdleBoosters)
        return
      }
    }
  } else {
    let control = creep.room.controller
    if (creep.upgradeController(control) === ERR_NOT_IN_RANGE) {
      creep.moveTo(control)
      return
    }
  }
}

/*
██████  ██    ██ ██ ██      ██████  ███████ ██████
██   ██ ██    ██ ██ ██      ██   ██ ██      ██   ██
██████  ██    ██ ██ ██      ██   ██ █████   ██████
██   ██ ██    ██ ██ ██      ██   ██ ██      ██   ██
██████   ██████  ██ ███████ ██████  ███████ ██   ██
*/
function builder (creep) {
  creep.checkEmpty()
  if (creep.fillNow()) {
    let spawn = creep.nearest_spawn()
    let pile = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
      filter: function (object) { return object.amount > 300 }})
    let link = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
      filter: function (object) { return (object.structureType === STRUCTURE_LINK && !object.transmitter() && object.energy > 0) }})
    let pile_d = pile ? pile.pos.getRangeTo(creep) : 100
    let link_d = link ? link.pos.getRangeTo(creep) : 100
    let spawn_d = spawn ? spawn.pos.getRangeTo(creep) : 100
    let room_energy_pct = 100 * creep.room.energyAvailable / creep.room.energyCapacityAvailable
    if (pile && (pile_d < (link_d + 4) && pile_d < (spawn_d + 4) || creep.room.energyAvailable < 1000)) {
      if (creep.pickup(pile) < 0) {
        let moveResult = creep.moveTo(pile)
        if (moveResult < 0 && moveResult !== ERR_BUSY && moveResult !== ERR_NO_PATH) {
          console.log(creep.name + " can't move to " + creep.destination() + ' error is ' + moveResult)
        }
        return
      }
    } else if (link && link_d < spawn_d) {
      if (link.transferEnergy(creep) === ERR_NOT_IN_RANGE) creep.moveTo(link)
      return
    } else if (creep.room.storage && creep.room.storage.store.energy > 10000) {
      let stor = creep.room.storage
      if (stor.transferEnergy(creep) === ERR_NOT_IN_RANGE) creep.moveTo(stor)
      return
    } else if (room_energy_pct > 80) {
      if (spawn.transferEnergy(creep) === ERR_NOT_IN_RANGE) creep.moveTo(spawn)
      return
    } else {
      if (!creep.pos.isNearTo(spawn)) {
        creep.moveTo(spawn)
        return
      }
    }
  } else {
    let targets = creep.room.find(FIND_CONSTRUCTION_SITES)
    if (targets.length) {
      if (creep.build(targets[0]) === ERR_NOT_IN_RANGE) creep.moveTo(targets[0])
      return
    } else {
      creep.moveTo(Game.flags.IdleBuilders)
      return
    }
  }
}

/*
 ██████ ██       █████  ██ ███    ███ ███████ ██████
██      ██      ██   ██ ██ ████  ████ ██      ██   ██
██      ██      ███████ ██ ██ ████ ██ █████   ██████
██      ██      ██   ██ ██ ██  ██  ██ ██      ██   ██
 ██████ ███████ ██   ██ ██ ██      ██ ███████ ██   ██
*/
function claimer (creep) {
  if (!creep.memory.target) {
    let control = _get_least_reserved_controller(creep.room.name)
    creep.say(control)
    // control = Game.getObjectById(control)
    // console.log(creep.name + ' targeting controller ' + control + ' in room ' + control.room.name)
    if (control) creep.memory.target = control
  }
  if (!creep.memory.target) {
    if (Game.flags.Claim && creep.room.name !== Game.flags.Claim.roomName) {
      if (!creep.pos.isNearTo(Game.flags.Claim)) creep.moveTo(Game.flags.Claim)
    } else if (Game.flags.Claim) {
      let control = creep.room.controller
      if (control) creep.memory.target = control.id
    }
  }
  let control = Game.getObjectById(creep.memory.target)
  // console.log('control ' + control)
  let who_reserved
  if (control && control.controller && control.controller.reservation) {
    who_reserved = control.controller.reservation.username
  }
  if (!creep.pos.isNearTo(control)) {
    creep.moveTo(control)
  } else {
    if (Game.flags.Claim && creep.room.name === Game.flags.Claim.roomName) {
      creep.claimController(control)
    } else if (who_reserved === 'Entropi' || who_reserved === undefined) {
      creep.reserveController(control)
    }
  }
}

/*
███████ ███    ██ ███████ ██████  ███████ ██   ██ ██ ███████ ████████ ███████ ██████
██      ████   ██ ██      ██   ██ ██      ██   ██ ██ ██         ██    ██      ██   ██
█████   ██ ██  ██ █████   ██████  ███████ ███████ ██ █████      ██    █████   ██████
██      ██  ██ ██ ██      ██   ██      ██ ██   ██ ██ ██         ██    ██      ██   ██
███████ ██   ████ ███████ ██   ██ ███████ ██   ██ ██ ██         ██    ███████ ██   ██
*/
function enershifter (creep) {
  creep.checkEmpty()
  if (creep.fillNow()) {
    let piles = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 8)
    if (piles.length) {
      let pile = creep.pos.findClosestByPath(piles)
      if (creep.pickup(pile) < 0) {
        let moveResult = creep.moveTo(pile)
        if (moveResult < 0 && moveResult !== ERR_BUSY && moveResult !== ERR_NO_PATH) {
          console.log(creep.name + " can't move to " + creep.destination() + ' error is ' + moveResult)
        }
        return
      }
    } else if (creep.room.storage && creep.room.storage.store.energy > 1000) {
      var stor = creep.room.storage
      if (stor.transferEnergy(creep) === ERR_NOT_IN_RANGE) creep.moveTo(stor)
      return
    } else {
      console.log('energy starved in room ' + creep.room.name)
      return
    }
  } else {
    let deposit_target = _get_nearest_store(creep)
    creep.destination(deposit_target)
    let transferResult = creep.transfer(deposit_target, RESOURCE_ENERGY)
    if (transferResult === ERR_NOT_IN_RANGE) {
      creep.moveTo(creep.destination())
      return
    } else if (transferResult !== 0) {
      // console.log('enershifter ' + creep.name + ' transfer issue ' + transferResult)
    }
  }
}

/*
███████ ███    ██ ███████ ██████  ████████ ██████   █████  ██ ███    ██
██      ████   ██ ██      ██   ██    ██    ██   ██ ██   ██ ██ ████   ██
█████   ██ ██  ██ █████   ██████     ██    ██████  ███████ ██ ██ ██  ██
██      ██  ██ ██ ██      ██   ██    ██    ██   ██ ██   ██ ██ ██  ██ ██
███████ ██   ████ ███████ ██   ██    ██    ██   ██ ██   ██ ██ ██   ████
*/
function enertrain (creep) {
  creep.memory.first_store = creep.memory.first_store || creep.room.storage.id
  creep.checkEmpty()
  if (creep.fillNow()) {
    let stor = Game.getObjectById(creep.memory.first_store)
    creep.memory.target = creep.memory.first_store
    if (stor && !creep.pos.isNearTo(stor)) {
      let res = creep.moveTo(stor)
      creep.say('mo ' + res)
    } else if (stor && creep.pos.isNearTo(stor)) {
      stor.transferEnergy(creep)
    } else {
      console.log(creep.name + ' no storage to fill!')
    }
  } else {
    if (Game.flags.Enertrain && creep.room.name !== Game.flags.Enertrain.roomName) {
      if (!creep.pos.isNearTo(Game.flags.Enertrain)) creep.moveTo(Game.flags.Enertrain)
    } else if (Game.flags.Enertrain && creep.room.name === Game.flags.Enertrain.roomName) {
      creep.destination(creep.room.storage.id)
      let transferResult = creep.transfer(creep.destination(), RESOURCE_ENERGY)
      if (transferResult === 0) {
        creep.memory.target = undefined
        creep.memory.destination = undefined
      } else if (transferResult === ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.destination())
        return
      } else if (transferResult !== 0) {
        console.log('enertrain ' + creep.name + ' transfer issue ' + transferResult)
      }
    }
  }
}

/*
███████  ██████  ██████  ██████  ███████ ██████
██      ██    ██ ██   ██ ██   ██ ██      ██   ██
█████   ██    ██ ██   ██ ██   ██ █████   ██████
██      ██    ██ ██   ██ ██   ██ ██      ██   ██
██       ██████  ██████  ██████  ███████ ██   ██
*/
function fodder (creep) {
  let flag = Game.flags['Stage']
  // let flag = Game.flags['FodderRush']
  // let flag = Game.flags['StageHome']
  creep.destination(flag)
  creep.moveTo(creep.destination())
}

/*
 ██████  ██    ██  █████  ██████  ██████
██       ██    ██ ██   ██ ██   ██ ██   ██
██   ███ ██    ██ ███████ ██████  ██   ██
██    ██ ██    ██ ██   ██ ██   ██ ██   ██
 ██████   ██████  ██   ██ ██   ██ ██████
*/
function guard (creep) {
  var targets = creep.room.find(FIND_HOSTILE_CREEPS)
  if (targets.length) {
    if (creep.attack(targets[0]) === ERR_NOT_IN_RANGE) {
      creep.moveTo(targets[0])
    }
  }
}

/*
██   ██  █████  ██████  ██    ██ ███████ ███████ ████████ ███████ ██████
██   ██ ██   ██ ██   ██ ██    ██ ██      ██         ██    ██      ██   ██
███████ ███████ ██████  ██    ██ █████   ███████    ██    █████   ██████
██   ██ ██   ██ ██   ██  ██  ██  ██           ██    ██    ██      ██   ██
██   ██ ██   ██ ██   ██   ████   ███████ ███████    ██    ███████ ██   ██
*/
function harvester (creep) {
  if (creep.carry.energy < creep.carryCapacity) {
    if (!creep.memory.target) {
      console.log('harvester ' + creep.name + ' getting unoccupied source')
      creep.memory.target = _get_unoccupied_source(creep.room.name)
    }
    let target = Game.getObjectById(creep.memory.target)
    // console.log('miner target = ' + target)

    let harvestResult = creep.harvest(target)
    if (harvestResult < 0 && (harvestResult === ERR_BUSY || harvestResult === ERR_NOT_IN_RANGE)) {
      creep.moveTo(target)
      return
    } else if (harvestResult !== 0) {
      console.log('harvester ' + creep.name + ' unable to harvest from ' + target + ' error is ' + harvestResult)
      return
    }
  } else {
    let deposit_target = _get_nearest_store(creep)
    creep.destination(deposit_target)
    let transferResult = creep.transfer(deposit_target, RESOURCE_ENERGY)
    if (transferResult === ERR_NOT_IN_RANGE) {
      creep.moveTo(creep.destination())
      return
    } else if (transferResult !== 0) {
      // console.log('harvester ' + creep.name + ' transfer issue ' + transferResult)
    }
  }
}

/*
██   ██ ███████  █████  ██      ███████ ██████
██   ██ ██      ██   ██ ██      ██      ██   ██
███████ █████   ███████ ██      █████   ██████
██   ██ ██      ██   ██ ██      ██      ██   ██
██   ██ ███████ ██   ██ ███████ ███████ ██   ██
*/
function healer (creep) {
  let target = _get_fix_target(creep.pos.findInRange(FIND_MY_CREEPS, 4).map(get_obj_id)) // || Game.getObjectById('56c45772758665455c65ca39') || Game.getObjectById('56c43f21adec93545c38f748')// || creep.pos.findClosestByRange(FIND_MY_CREEPS)
  console.log(creep.name + ' heal target ' + target)
  if (Game.flags.Strike && creep.room.name !== Game.flags.Strike.roomName) {
    creep.memory.target = 'Strike'
    // let flag = Game.flags['StrikeStage']
    let flag = Game.flags['Strike']
    creep.destination(flag)
    creep.moveTo(creep.destination())
  } else if (target) {
    creep.memory.target = target
    let tar = Game.getObjectById(target)
    if (!creep.pos.isNearTo(tar)) {
      creep.moveTo(tar)
    }
    let heal_result = creep.heal(tar)
    console.log(creep.name + ' healing result ' + heal_result)
  } else {
    creep.memory.target = 'Strike'
    // let flag = Game.flags['StrikeStage']
    let flag = Game.flags['Strike']
    flag = Game.flags.heal
    creep.destination(flag)
    creep.moveTo(creep.destination())
  }
}

/*
██      ██ ███    ██ ██   ██ ██      ██ ███    ██  ██████
██      ██ ████   ██ ██  ██  ██      ██ ████   ██ ██
██      ██ ██ ██  ██ █████   ██      ██ ██ ██  ██ ██   ███
██      ██ ██  ██ ██ ██  ██  ██      ██ ██  ██ ██ ██    ██
███████ ██ ██   ████ ██   ██ ███████ ██ ██   ████  ██████
*/
function linkling (creep) {
  var link = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
    filter: function (object) { return (object.structureType === STRUCTURE_LINK && !object.transmitter()) }})
  let spawn = creep.nearest_spawn()
  creep.checkEmpty()
  if (creep.fillNow()) {
    creep.memory.target = null
    if (link && link.pos.getRangeTo(creep) < spawn.pos.getRangeTo(creep) && link.energy > 0) {
      if (link.transferEnergy(creep) === ERR_NOT_IN_RANGE) creep.moveTo(link)
      return
    } else if (creep.room.storage && creep.room.storage.store.energy > 1000) {
      let stor = creep.room.storage
      if (stor.transferEnergy(creep) === ERR_NOT_IN_RANGE) creep.moveTo(stor)
      return
    } else if (creep.room.energyAvailable > 1000) {
      if (spawn.transferEnergy(creep) === ERR_NOT_IN_RANGE) creep.moveTo(spawn)
      return
    } else {
      if (!creep.pos.isNearTo(spawn)) {
        creep.moveTo(spawn)
        return
      }
    }
  } else {
    // var towers = creep.pos.findInRange(FIND_MY_STRUCTURES, 4, { filter: { structureType: STRUCTURE_TOWER } } )
    var towers = creep.room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } })
    if (towers.length) {
      if (!creep.memory.target) {
        for (let tower of towers) {
          // if (tower.id === '56941937254d91ca66b28b27') continue
          if (tower.has_attention('linkling') < 1 && tower.energy < tower.energyCapacity - 50) {
            creep.memory.target = tower.id
            // console.log('linkling ' + creep.name + ' - attaching to tower ' + tower.id + ' - tower attenders = ' + tower.has_attention('linkling'))
            break
          }
        }
      }
      if (!creep.memory.target) creep.destination(link)
      else creep.destination(creep.memory.target)
      let transferResult = creep.transfer(creep.destination(), RESOURCE_ENERGY)
      if (transferResult === ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.destination())
        return
      } else if (transferResult !== 0) {
        // console.log('mule ' + creep.name + ' transfer issue ' + transferResult)
      }
    }
  }
}

/*
███    ███ ██ ███    ██ ███████ ██████
████  ████ ██ ████   ██ ██      ██   ██
██ ████ ██ ██ ██ ██  ██ █████   ██████
██  ██  ██ ██ ██  ██ ██ ██      ██   ██
██      ██ ██ ██   ████ ███████ ██   ██
*/
function miner (creep) {
  var pctFull = 100 * creep.carry.energy / creep.carryCapacity
  var link = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: _transmitters })
  var tower = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } })
  if (pctFull < 90) {
    let pile = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, 1)
    if (pile && link && link.energy < link.energyCapacity) creep.pickup(pile)
    if (!creep.memory.target) {
      console.log('miner ' + creep.name + ' getting unoccupied source')
      creep.memory.target = _get_unoccupied_source(creep.room.name)
    }
    let target = Game.getObjectById(creep.memory.target)
    // console.log('miner target = ' + target)
    if (!creep.pos.isNearTo(target)) {
      creep.destination(target)
      let move_result = creep.moveTo(creep.destination())
      if (move_result === ERR_INVALID_TARGET) {
        // console.log("invalid miner target " + target + " creep memory target " + creep.memory.target)
        let roomholder = new RoomPosition(25, 25, Memory.ref.sources[creep.memory.target])
        creep.destination(roomholder)
        creep.moveTo(roomholder)
        // let move_result = creep.moveTo(roomholder)
        // console.log('miner ' + creep.name + ' move result ' + move_result + ' destination ' + roomholder)
      }
      return
    }
    let harvestResult = creep.harvest(target)
    // creep.say(harvestResult)
    if (harvestResult === ERR_BUSY) {
      return
    } else if (harvestResult === ERR_NOT_ENOUGH_RESOURCES) {
      creep.dropEnergy()
      return
    } else if (harvestResult !== 0) {
      console.log('miner ' + creep.name + ' unable to harvest from ' + target + ' error is ' + harvestResult)
    }
  } else if (link && creep.pos.isNearTo(link)) {
    let transferResult = creep.transfer(link, RESOURCE_ENERGY)
    if (transferResult === ERR_NOT_IN_RANGE) {
      creep.moveTo(creep.destination())
      // let move_result = creep.moveTo(creep.destination())
      // console.log('miner ' + creep.name + ' move result ' + move_result)
      return
    } else if (transferResult !== 0) {
      creep.dropEnergy()
      return
    // console.log('miner ' + creep.name + ' transfer issue ' + transferResult)
    }
  } else if (tower && creep.pos.isNearTo(tower)) {
    creep.transfer(tower, RESOURCE_ENERGY)
  } else {
    // creep.say('drop energy!')
    creep.dropEnergy()
    return
  }
}

/*
███    ███ ██    ██ ██      ███████
████  ████ ██    ██ ██      ██
██ ████ ██ ██    ██ ██      █████
██  ██  ██ ██    ██ ██      ██
██      ██  ██████  ███████ ███████
*/
function mule (creep) {
  var my_spawns = creep.room.find(FIND_MY_STRUCTURES, {
    filter: function (object) { return object.structureType === STRUCTURE_SPAWN }})
  if (my_spawns && my_spawns.length) {
    creep.memory.last_spawn = my_spawns[0].name
  }
  var miners = _find_miners(creep.room.name)
  //  console.log('mule ' + creep.name + ' miners length ' + miners.length)
  var resource = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
    filter: function (object) { return creep.pos.isNearTo(object) }})
  var piles = creep.room.find(FIND_DROPPED_RESOURCES)
  // console.log('resource ' + resource)
  creep.checkEmpty()
  if (miners.length && creep.fillNow()) {
    if (!creep.memory.target) {
      let min_attention = 1000
      for (let miner of miners) {
        // console.log(JSON.stringify(miner, null, 2))
        let miner_target = Game.getObjectById(miner.memory.target)
        if (miner.memory.target === '55c34a6c5be41a0a6e80caeb' || miner.memory.target === '55c34a6b5be41a0a6e80c338') continue // leave more to boosters
        if (miner_target && miner_target.room.name !== creep.room.name) continue
        let attention = miner.has_attention('mule')
        if (attention < min_attention) min_attention = attention
      }
      for (let minern of miners) {
        // console.log(miner.has_attention('mule'))
        let attention = minern.has_attention('mule')
        // console.log('mule ' + creep.name + ' looking at miner ' + minern.name + ' with id ' + minern.id + ' attention ' + attention)
        if (attention === min_attention && attention < 3) {
          if (minern.memory.target === '55c34a6c5be41a0a6e80caeb' || minern.memory.target === '55c34a6b5be41a0a6e80c338') continue // leave more to boosters
          console.log('mule ' + creep.name + ' got to check 2 on miner ' + minern.name + ' with id ' + minern.id + ' attention ' + minern.has_attention('mule'))
          // if (minern.memory.target === '55c34a6c5be41a0a6e80caeb' && minern.has_attention('mule') >= 1)
          creep.memory.target = minern.id
          console.log('mule ' + creep.name + ' - attaching to miner ' + minern.name + ' - miner attenders = ' + minern.has_attention('mule'))
          break
        }
      }
    }
    creep.destination(creep.memory.target)
    if (!creep.memory.target) {
      creep.destination(piles[0])
    // console.log('mule ' + creep.name + ' found pile ' + piles[0])
    }
    if (creep.destination()) {
      if (creep.pickup(resource) < 0) {
        let moveResult = creep.moveTo(creep.destination())
        if (moveResult < 0 && moveResult !== ERR_BUSY && moveResult !== ERR_NO_PATH && moveResult !== ERR_TIRED) {
          console.log(creep.name + " can't move to " + creep.destination() + ' error is ' + moveResult)
          creep.memory.target = undefined
          creep.memory.destination = undefined
          return
        } else {
          // console.log('problem with mule ' + creep.name + ' destination is ' + creep.destination() + ' pickup result ' + creep.pickup(resource) + ' pickup target ' + resource)
        }
      }
    } else {
      creep.memory.target = undefined
      creep.memory.destination = undefined
      if (!creep.pos.isNearTo(Game.flags.IdleMules)) {
        creep.moveTo(Game.flags.IdleMules)
        return
      }
    }
  } else if (creep.fillNow()) {
    creep.destination(piles[0])
    if (creep.pickup(creep.destination()) === ERR_NOT_IN_RANGE) {
      creep.moveTo(creep.destination())
      return
    }
  } else {
    // creep.moveTo(new RoomPosition(25, 25, Game.rooms['W18S3']))
    let deposit_target = _get_nearest_store(creep)
    if (!deposit_target) {
      deposit_target = Game.spawns[creep.memory.last_spawn]
    }
    creep.destination(deposit_target)
    // console.log("mule " + creep.name + " deposit_target " + deposit_target)
    let transferResult = creep.transfer(creep.destination(), RESOURCE_ENERGY)
    if (transferResult === 0) {
      creep.memory.target = undefined
      creep.memory.destination = undefined
    } else if (transferResult === ERR_NOT_IN_RANGE) {
      creep.moveTo(creep.destination())
      // let moveresult = creep.moveTo(creep.destination())
      // console.log('mule ' + creep.name + ' move result ' + moveresult + ' move target ' + creep.destination())
      return
    } else if (transferResult !== 0) {
      console.log('mule ' + creep.name + ' transfer issue ' + transferResult)
    }
  }
}

/*
██████  ███████ ███    ███  ██████  ████████ ███████         ███    ███ ██    ██ ██      ███████
██   ██ ██      ████  ████ ██    ██    ██    ██              ████  ████ ██    ██ ██      ██
██████  █████   ██ ████ ██ ██    ██    ██    █████           ██ ████ ██ ██    ██ ██      █████
██   ██ ██      ██  ██  ██ ██    ██    ██    ██              ██  ██  ██ ██    ██ ██      ██
██   ██ ███████ ██      ██  ██████     ██    ███████ ███████ ██      ██  ██████  ███████ ███████
*/
function remote_mule (creep) {
  var my_spawns = creep.room.find(FIND_MY_STRUCTURES, {
    filter: function (object) { return object.structureType === STRUCTURE_SPAWN }})
  if (my_spawns && my_spawns.length) creep.memory.last_spawn = my_spawns[0].name
  var piles = creep.room.find(FIND_DROPPED_RESOURCES)
  var resource = creep.pos.findClosestByRange(piles, {
    filter: function (object) { return creep.pos.isNearTo(object) }})
  creep.checkEmpty()
  if (creep.fillNow()) {
    if (!creep.memory.target) {
      var miners = _find_miners(Game.spawns[creep.memory.last_spawn].room.name, 'exploited')
      // console.log('mule ' + creep.name + ' miners length ' + miners.length)
      if (miners && miners.length) {
        let min_attention = 1000
        for (let miner of miners) {
          // console.log(JSON.stringify(miner, null, 2))
          if (miner.memory.target === '55c34a6c5be41a0a6e80caeb' || miner.memory.target === '55c34a6b5be41a0a6e80c338') continue // leave more to boosters
          let attention = miner.has_attention('remote_mule')
          if (attention < min_attention) min_attention = attention
        }
        for (let minern of miners) {
          // console.log(miner.has_attention('remote_mule'))
          let attention = minern.has_attention('remote_mule')
          // console.log('mule ' + creep.name + ' looking at miner ' + minern.name + ' with id ' + minern.id + ' attention ' + attention)
          if (attention === min_attention && attention < 3) {
            if (minern.memory.target === '55c34a6c5be41a0a6e80caeb' || minern.memory.target === '55c34a6b5be41a0a6e80c338') continue // leave more to boosters
            // console.log('mule ' + creep.name + ' got to check 2 on miner ' + minern.name + ' with id ' + minern.id + ' attention ' + minern.has_attention('remote_mule'))
            // if (minern.memory.target === '55c34a6c5be41a0a6e80caeb' && minern.has_attention('mule') >= 1)
            creep.memory.target = minern.id
            console.log('mule ' + creep.name + ' - attaching to miner ' + minern.name + ' - miner attenders = ' + minern.has_attention('remote_mule'))
            break
          }
        }
      }
      if (!creep.memory.target && piles && piles.length) {
        creep.memory.target = piles[0]
        // console.log('mule ' + creep.name + ' found pile ' + piles[0])
      } else if (!creep.memory.target) {
        console.log('creep ' + creep.name + ' not able to find somewhere to fill!')
        creep.say('remu wher?')
        return
      }
      creep.destination(creep.memory.target)
    }
    if (creep.pickup(resource) < 0) {
      let moveResult = creep.moveTo(creep.destination())
      if (moveResult < 0 && moveResult !== ERR_BUSY && moveResult !== ERR_NO_PATH && moveResult !== ERR_TIRED) {
        console.log(creep.name + " can't move to " + creep.destination() + ' error is ' + moveResult)
        creep.memory.target = undefined
        creep.memory.destination = undefined
        return
      } else {
        // console.log('problem with mule ' + creep.name + ' destination is ' + creep.destination() + ' pickup result ' + creep.pickup(resource) + ' pickup target ' + resource)
      }
    }
  } else {
    let repairt = _get_fix_target(creep.pos.findInRange(FIND_STRUCTURES, 3, { filter: { structureType: STRUCTURE_ROAD } }).map(get_obj_id))
    // let repairt = creep.pos.lookFor('structure')
    if (repairt) {
      creep.repair(Game.getObjectById(repairt))
      // let repair_result = creep.repair(Game.getObjectById(repairt))
      // console.log(creep.name + ' repair target ' + repairt + ' repair result ' + repair_result)
    }
      // let repair_result = creep.repair(repairt)
    // return
    let buildt = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES)
    if (buildt && creep.pos.inRangeTo(buildt, 3)) creep.build(buildt)
    let deposit_target
    if (creep.room.name === 'W18S3') {
      deposit_target = creep.room.storage
    } else {
      deposit_target = _get_nearest_store(creep)
    }
    if (!deposit_target) {
      deposit_target = Game.spawns[creep.memory.last_spawn]
    }
    creep.destination(deposit_target)
    // console.log("mule " + creep.name + " deposit_target " + deposit_target)
    let transferResult = creep.transfer(creep.destination(), RESOURCE_ENERGY)
    if (transferResult === 0) {
      creep.memory.target = undefined
      creep.memory.destination = undefined
    } else if (transferResult === ERR_NOT_IN_RANGE) {
      creep.moveTo(creep.destination())
      // let moveresult = creep.moveTo(creep.destination())
      // console.log('mule ' + creep.name + ' move result ' + moveresult + ' move target ' + creep.destination())
      return
    } else if (transferResult !== 0) {
      console.log('mule ' + creep.name + ' transfer issue ' + transferResult)
    }
  }
}

/*
██████  ███████ ███    ███  ██████  ████████ ███████         ██████  ██    ██ ██ ██      ██████  ███████ ██████
██   ██ ██      ████  ████ ██    ██    ██    ██              ██   ██ ██    ██ ██ ██      ██   ██ ██      ██   ██
██████  █████   ██ ████ ██ ██    ██    ██    █████           ██████  ██    ██ ██ ██      ██   ██ █████   ██████
██   ██ ██      ██  ██  ██ ██    ██    ██    ██              ██   ██ ██    ██ ██ ██      ██   ██ ██      ██   ██
██   ██ ███████ ██      ██  ██████     ██    ███████ ███████ ██████   ██████  ██ ███████ ██████  ███████ ██   ██
*/
function remote_builder (creep) {
  if (creep.pos.isNearTo(creep.room.controller)) {
    // let result = creep.claimController(creep.room.controller)
    let control = creep.room.controller
    if (creep.upgradeController(control) === ERR_NOT_IN_RANGE) creep.moveTo(control)
  }
  creep.checkEmpty()
  if (creep.fillNow()) {
    let pile = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
      filter: function (object) { return object.amount > 300 }})
    if (Memory.rooms[creep.room.name].spawns && creep.room.energyAvailable > 1500) {
      let spawn = creep.nearest_spawn()
      let link = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
        filter: function (object) { return (object.structureType === STRUCTURE_LINK && !object.transmitter() && object.energy > 0) }})
      let pile_d = pile ? pile.pos.getRangeTo(creep) : 100
      let link_d = link ? link.pos.getRangeTo(creep) : 100
      let spawn_d = spawn ? spawn.pos.getRangeTo(creep) : 100

      if (pile && pile_d < link_d && pile_d < spawn_d) {
        if (creep.pickup(pile) < 0) {
          let moveResult = creep.moveTo(pile)
          if (moveResult < 0 && moveResult !== ERR_BUSY && moveResult !== ERR_NO_PATH) {
            console.log(creep.name + " can't move to " + creep.destination() + ' error is ' + moveResult)
          }
          return
        }
      } else if (link && link_d < spawn_d) {
        if (link.transferEnergy(creep) === ERR_NOT_IN_RANGE) creep.moveTo(link)
        return
      } else if (creep.room.storage && creep.room.storage.store.energy > 10000) {
        let stor = creep.room.storage
        if (stor.transferEnergy(creep) === ERR_NOT_IN_RANGE) creep.moveTo(stor)
        return
      } else if (creep.room.energyAvailable > 1000) {
        if (spawn.transferEnergy(creep) === ERR_NOT_IN_RANGE) creep.moveTo(spawn)
        return
      }
    }
    if (pile) {
      if (creep.pickup(pile) < 0) creep.moveTo(pile)
      return
    }
    if (!creep.memory.target) {
      console.log('remote_builder ' + creep.name + ' getting unoccupied source')
      creep.memory.target = _get_unoccupied_source(creep.room.name)
    }
    if (creep.memory.target) {
      let target = Game.getObjectById(creep.memory.target)
      let harvestResult = creep.harvest(target)
      if (harvestResult < 0 && (harvestResult === ERR_BUSY || harvestResult === ERR_NOT_IN_RANGE || harvestResult === ERR_INVALID_TARGET)) {
        creep.moveTo(target)
        return
      } else if (harvestResult === ERR_NOT_ENOUGH_RESOURCES) {
        creep.memory.target = _get_unoccupied_source(creep.room.name)
        if (!creep.memory.target) {
          creep.dropEnergy()
          return
        }
      } else if (harvestResult !== 0) {
        console.log('remote_builder ' + creep.name + ' unable to harvest from ' + target + ' error is ' + harvestResult)
        return
      } else {
        return
      }
    }
    let exploiter = creep.getExploitingRoom()
    if (exploiter) {
      creep.moveTo(new RoomPosition(25, 25, Game.rooms[exploiter]))
      return
    } else {
      console.log('remote_builder confused, not refilling ' + creep.name)
    }
  } else {
    creep.memory.target = null
    if (Game.flags.Stage && creep.room.name !== Game.flags.Stage.roomName && creep.room.name !== 'W16S2') {
      creep.moveTo(Game.flags.Stage)
      return
    } else {
      let targets = creep.room.find(FIND_CONSTRUCTION_SITES)
      // let targets = null
      if (targets && targets.length) {
        if (creep.build(targets[0]) === ERR_NOT_IN_RANGE) creep.moveTo(targets[0])
        return
      } else {
        creep.moveTo(Game.flags.Stage)
        return
      }
    }
  }
}

/*
██████  ███████ ███    ███  ██████  ████████ ███████         ██████  ███████ ██████   █████  ██ ██████  ███████
██   ██ ██      ████  ████ ██    ██    ██    ██              ██   ██ ██      ██   ██ ██   ██ ██ ██   ██ ██
██████  █████   ██ ████ ██ ██    ██    ██    █████           ██████  █████   ██████  ███████ ██ ██████  ███████
██   ██ ██      ██  ██  ██ ██    ██    ██    ██              ██   ██ ██      ██      ██   ██ ██ ██   ██      ██
██   ██ ███████ ██      ██  ██████     ██    ███████ ███████ ██   ██ ███████ ██      ██   ██ ██ ██   ██ ███████
*/
function remote_repairs (creep) {
  creep.checkEmpty()
  if (creep.fillNow()) {
    let pile = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
      filter: function (object) { return object.amount > 300 }})
    if (Memory.rooms[creep.room.name].spawns) {
      let spawn = creep.nearest_spawn()
      let link = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
        filter: function (object) { return (object.structureType === STRUCTURE_LINK && !object.transmitter() && object.energy > 0) }})
      let pile_d = pile ? pile.pos.getRangeTo(creep) : 100
      let link_d = link ? link.pos.getRangeTo(creep) : 100
      let spawn_d = spawn ? spawn.pos.getRangeTo(creep) : 100

      if (pile && pile_d < link_d && pile_d < spawn_d) {
        if (creep.pickup(pile) < 0) {
          let moveResult = creep.moveTo(pile)
          if (moveResult < 0 && moveResult !== ERR_BUSY && moveResult !== ERR_NO_PATH) {
            console.log(creep.name + " can't move to " + creep.destination() + ' error is ' + moveResult)
          }
        }
      } else if (link && link_d < spawn_d) {
        if (link.transferEnergy(creep) === ERR_NOT_IN_RANGE) creep.moveTo(link)
      } else if (creep.room.storage && creep.room.storage.store.energy > 10000) {
        let stor = creep.room.storage
        if (stor.transferEnergy(creep) === ERR_NOT_IN_RANGE) creep.moveTo(stor)
      } else if (creep.room.energyAvailable > 1000) {
        if (spawn.transferEnergy(creep) === ERR_NOT_IN_RANGE) creep.moveTo(spawn)
      }
    } else if (pile) {
      if (creep.pickup(pile) < 0) creep.moveTo(pile)
    } else if (!creep.memory.target) {
      console.log('remote_repairs ' + creep.name + ' getting unoccupied source')
      creep.memory.target = _get_unoccupied_source(creep.room.name)
      let target = Game.getObjectById(creep.memory.target)
      // console.log('miner target = ' + target)
      let exploiter = creep.getExploitingRoom()
      if (creep.memory.target) {
        let harvestResult = creep.harvest(target)
        if (harvestResult < 0 && (harvestResult === ERR_BUSY || harvestResult === ERR_NOT_IN_RANGE)) {
          creep.moveTo(target)
        } else if (harvestResult === ERR_NOT_ENOUGH_RESOURCES) {
          creep.dropEnergy()
        } else if (harvestResult !== 0) {
          console.log('remote_repairs ' + creep.name + ' unable to harvest from ' + target + ' error is ' + harvestResult)
        }
      } else if (exploiter) {
        creep.moveTo(new RoomPosition(25, 25, Game.rooms[exploiter]))
      } else {
        console.log('remote_repairs confused, not refilling ' + creep.name)
      }
    }
  } else {
    creep.memory.target = null
    if (Game.flags.Repair && creep.room.name !== Game.flags.Repair.roomName) {
      creep.moveTo(Game.flags.Repair)
    } else {
      let target = Game.getObjectById(Memory.rooms[creep.room.name].needsRepair)
      if (target) {
        if (creep.repair(target) === ERR_NOT_IN_RANGE) creep.moveTo(target)
      } else {
        creep.moveTo(Game.flags.Repair)
      }
    }
  }
}

/*
██████  ███████ ██████   █████  ██ ██████  ███████
██   ██ ██      ██   ██ ██   ██ ██ ██   ██ ██
██████  █████   ██████  ███████ ██ ██████  ███████
██   ██ ██      ██      ██   ██ ██ ██   ██      ██
██   ██ ███████ ██      ██   ██ ██ ██   ██ ███████
*/
function repairs (creep) {
  creep.checkEmpty()
  if (creep.fillNow()) {
    let spawn = creep.nearest_spawn()
    let pile = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
      filter: function (object) { return object.amount > 300 }})
    let link = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
      filter: function (object) { return (object.structureType === STRUCTURE_LINK && !object.transmitter() && object.energy > 0) }})
    let pile_d = pile ? pile.pos.getRangeTo(creep) : 100
    let link_d = link ? link.pos.getRangeTo(creep) : 100
    let spawn_d = spawn ? spawn.pos.getRangeTo(creep) : 100
    if (pile && (pile_d < link_d && pile_d < spawn_d || creep.room.energyAvailable < 1000)) {
      if (creep.pickup(pile) < 0) {
        let moveResult = creep.moveTo(pile)
        if (moveResult < 0 && moveResult !== ERR_BUSY && moveResult !== ERR_NO_PATH) {
          console.log(creep.name + " can't move to " + creep.destination() + ' error is ' + moveResult)
        }
      }
    } else if (link && link_d < spawn_d) {
      if (link.transferEnergy(creep) === ERR_NOT_IN_RANGE) creep.moveTo(link)
    } else if (creep.room.storage && creep.room.storage.store.energy > 10000) {
      let stor = creep.room.storage
      if (stor.transferEnergy(creep) === ERR_NOT_IN_RANGE) creep.moveTo(stor)
    } else if (creep.room.energyAvailable > 1000) {
      if (spawn.transferEnergy(creep) === ERR_NOT_IN_RANGE) creep.moveTo(spawn)
    } else {
      if (!creep.pos.isNearTo(spawn)) {
        creep.moveTo(spawn)
      }
    }
  } else {
    let target = Game.getObjectById(Memory.rooms[creep.room.name].needsRepair)
    if (target) {
      if (creep.repair(target) === ERR_NOT_IN_RANGE) creep.moveTo(target)
    } else {
      // creep.moveTo(Game.flags.IdleBuilders)
    }
  }
}

/*
███████  ██████  ██████  ██    ██ ████████
██      ██      ██    ██ ██    ██    ██
███████ ██      ██    ██ ██    ██    ██
     ██ ██      ██    ██ ██    ██    ██
███████  ██████  ██████   ██████     ██
*/
function scout (creep) {
  if (creep.pos.isNearTo(creep.room.controller)) {
    // let result = creep.claimController(creep.room.controller)
  }
  if (!creep.destination()) {
    // dont double up scouts
    var scouts = Memory.rooms['W18S3'].creep_counts['scout']
    if (scouts.length) {
      var other_scouts = []
      for (let scout of scouts) {
        console.log(scout)
        if (this.name !== scouts[scout]) {
          other_scouts.push(Game.getObjectById(scouts[scout]).destination())
        }
      }
    }
    // GET ROOMS TAGGED FOR SCOUTING
    let flag = Game.flags['Enew']
    // if there are no friendly units in that room get flag as target
    if (!Game.rooms[flag.pos.roomName]) {
      // if no other scouts own that room
      if (!other_scouts) {
        creep.say('no other scouts')
        creep.destination(flag)
      } else if (other_scouts.indexOf(flag.id) === -1) {
        creep.destination(flag)
      }
    }
  } else {
    creep.moveTo(creep.destination())
  }
}

/*
███████ ████████ ██████  ██ ██   ██ ███████ ██████
██         ██    ██   ██ ██ ██  ██  ██      ██   ██
███████    ██    ██████  ██ █████   █████   ██████
     ██    ██    ██   ██ ██ ██  ██  ██      ██   ██
███████    ██    ██   ██ ██ ██   ██ ███████ ██   ██
*/
function striker (creep) {
  // var tower = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } } )
  // var tower = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES)
  // var tower = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES)
  // var tower = creep.pos.findClosestByRange(FIND_STRUCTURES)
  var tower = null
  // console.log(tower)
  if (creep.pos.isNearTo(creep.room.controller)) {
    // let result = creep.claimController(creep.room.controller)
    // console.log('claim controller ' + result)
  }
  if (tower) {
    let attack_result = creep.attack(tower)
    if (attack_result === ERR_NOT_IN_RANGE) {
      creep.moveTo(tower)
    } else {
      creep.moveTo(tower)
      console.log(attack_result)
    }
  } else {
    var target = null
    // let target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
    // if (creep.room.name === 'W19S4') target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES)
    // if (creep.room.name === 'W17S3') target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, { filter: { structureType: STRUCTURE_EXTENSION } } )
    // if (creep.room.name === 'W17S3') target = creep.pos.findClosestByRange(FIND_STRUCTURES)
    if (creep.room.name === 'W18S4') {
      target = null // Game.getObjectById('56bede99499a605b1bbe1e0f') || Game.getObjectById('56bede99499a605b1bbe1e0f') // ||
        // Game.getObjectById('56bf20713c74ed791b015b80') || Game.getObjectById('56b38159b7fe314a08235a8f') || Game.getObjectById('56b1982d0364171360830448') ||
        // creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS) ||
        // creep.pos.findClosestByRange(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_WALL }}) ||
        // creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES) //, { filter: { structureType: STRUCTURE_LINK } })
    }
    if (creep.name === 'StrikerX_W18S3' || creep.name === 'Striker_W18S3-2' || creep.name === 'Striker_W18S3-1' && creep.room.name === 'W14S1') {
      target = Game.getObjectById('56c0498bf2b8ad830f1424a0') || Game.getObjectById('567e509880979e716890d950') || Game.getObjectById('5681ca0ad5dc191b49471ff1') ||
        creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
    }
    if (creep.room.name === 'W19S4' || creep.room.name === 'W19S3') {
      target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS) // Game.getObjectById('56c3638ae1320cbb1207ce0a') || Game.getObjectById('56c3608358b6ec557f853f16') ||  Game.getObjectById('56c353e5f4b83fa212bc43de') ||
    }
    if (creep.name === 'strike3') target = null
    // if (creep.room.name === 'W18S4') target = creep.pos.findClosestByRange(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_WALL } })
    // if (creep.name === 'Strike4') target = Game.getObjectById('567d3b4688bfe6441d7ce531')
    //    if (creep.room.name === 'W18S4') {
    //      target = Game.getObjectById('5685be199519ea8b01a2493f') ||
    //        Game.getObjectById('5682d3133e4671c477fb3410') ||
    //        creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
    //    }
    // let target = Game.getObjectById('569fc6618b8d3c5f3bc5dcfa')
    // console.log('striker target ' + target)
    if (target) {
      let attack_result = creep.attack(target)
      // console.log('striker attack result - ' + attack_result)
      if (attack_result === ERR_NOT_IN_RANGE) {
        creep.moveTo(target)
      }
    } else {
      // let flag = Game.flags['StrikeStage']
      let flag = Game.flags['Strike']
      creep.destination(flag)
      creep.moveTo(creep.destination())
    }
  }
}

/*
███████ ██ ███    ██ ██████      ███████ ████████ ██    ██ ███████ ███████
██      ██ ████   ██ ██   ██     ██         ██    ██    ██ ██      ██
█████   ██ ██ ██  ██ ██   ██     ███████    ██    ██    ██ █████   █████
██      ██ ██  ██ ██ ██   ██          ██    ██    ██    ██ ██      ██
██      ██ ██   ████ ██████      ███████    ██     ██████  ██      ██
*/
//  Filters for find operations
// var _stored_energy = function (object) {
//   return ((object.energy > 10) || (object.structureType === STRUCTURE_STORAGE && object.store.energy > 10))
// }
var _storage_spawn_extension = function (object) {
  return ((object.energy < object.energyCapacity) && (object.structureType === STRUCTURE_EXTENSION || object.structureType === STRUCTURE_SPAWN))
}
var _transmitters = function (object) {
  return (object.structureType === STRUCTURE_LINK && object.transmitter() && object.energy < object.energyCapacity)
}
// var _receivers = function (object) {
//   return (object.structureType === STRUCTURE_LINK && !object.transmitter() && object.energy > 50)
// }
var _storage_other = function (object) {
  return ((object.energy < object.energyCapacity - 50) && object.structureType !== STRUCTURE_LINK)
}
var _storage_structure = function (object) {
  return (object.structureType === STRUCTURE_STORAGE && object.store.energy < object.storeCapacity - 50)
}
// var _storage_struct = function (object) {
//  return (object.structureType === STRUCTURE_STORAGE)
// }
// var _needs_repair = function (object) {
//   return ((object.structureType !== STRUCTURE_WALL && object.structureType !== STRUCTURE_RAMPART && (object.hits < object.hitsMax)) ||
//   (object.structureType === STRUCTURE_RAMPART && (object.hits < Memory.rooms[object.room.name].wallHP)) ||
//   (object.structureType === STRUCTURE_WALL && (object.hits < Memory.rooms[object.room.name].wallHP))
//   )
// }

var _get_nearest_store = function (creep, no_storage) {
  var obj = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: _storage_spawn_extension}) ||
    creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: _transmitters}) ||
    creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: _storage_other}) ||
    creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: _storage_structure}) ||
    null
  if (no_storage && obj.structureType === STRUCTURE_STORAGE) return null
  return obj
}

// var _get_nearest_store_available = function (creep) {
//   var obj = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: _receivers}) ||
//     creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {filter: _storage_structure})
//   return obj
// }

var _get_least_reserved_controller = function (room_name) {
  if (Memory.rooms[room_name].exploits) {
    let exploited_controllers = []
    for (let room of Memory.rooms[room_name].exploits) {
      let control_id = Memory.rooms[room].controller.id
      exploited_controllers.push(control_id)
    }
    let min_reserve = 100000
    for (let controllerid of exploited_controllers) {
      let controller = Game.getObjectById(controllerid)
      if (!controller || controller.my) continue
      if (!controller.reservation) return controllerid
      if (controller.reservation) {
        let reserve = controller.reservation.ticksToEnd
        if (reserve < min_reserve) min_reserve = reserve
      }
    }
    for (let room of Memory.rooms[room_name].exploits) {
      let control_id = Memory.rooms[room].controller.id
      let controller = Game.getObjectById(control_id)
      // console.log('controller ' + controller.my + ' ' + controller.reservation)
      console.log(room_name + ' controller ' + controller + ' mem id ' + control_id + ' reservation ' + controller.reservation.ticksToEnd)
      if (controller && !controller.my && controller.reservation.ticksToEnd === min_reserve) {
        return control_id
        // attention = controller.has_attention('claimer')
        // console.log('controller ' + controller + ' attention level of controller: ' + attention)
      }
    }
  }
  return undefined
}

var _get_unoccupied_source = function (room_name) {
  var sources = Game.rooms[room_name].find(FIND_SOURCES)
  for (let key in sources) {
    let attention = sources[key].has_attention('miner') || sources[key].has_attention('remote_builder')
    console.log('source ' + sources[key].id + ' attention level of source: ' + attention)
    if (!attention) {
      return sources[key].id
    // } else if (sources[key].id === '55c34a6b5be41a0a6e80c339' && attention < 3) {
    //   return sources[key].id
    }
  }
  if (Memory.rooms[room_name].exploits) {
    for (let room of Memory.rooms[room_name].exploits) {
      console.log('get unoc room source' + room + ' from ' + room_name)
      let sources = Memory.rooms[room].sources
      for (let key in sources) {
        var attention = 0
        let source = Game.getObjectById(sources[key])
        console.log('source key ' + sources[key] + ' source ' + source)
        if (source) {
          attention = source.has_attention('miner')
          console.log('source ' + sources[key] + ' attention level of source: ' + attention)
        } else {
          return sources[key]
        }
        if (!attention) {
          return sources[key]
        }
      }
    }
  }
}

var _find_miners = function (room_name, exploited) {
  var all_miners = []
  if (!exploited) {
    let room_miners = Game.rooms[room_name].find(FIND_MY_CREEPS, {
      filter: function (creep) { return creep.memory.role === 'miner' }})
    if (room_miners.length) all_miners.push(room_miners)
  // console.log("room " + room_name + " exploits " + Memory.rooms[room_name].exploits)
  }
  if (exploited) {
    if (Memory.rooms[room_name].exploits) {
      for (let room of Memory.rooms[room_name].exploits) {
        if (Game.rooms[room]) {
          let room_miners = Game.rooms[room].find(FIND_MY_CREEPS, {
            filter: function (creep) { return creep.memory.role === 'miner' }})
          // console.log('find miners - room ' + room + ' miners ' + room_miners)
          if (room_miners.length) all_miners.push(room_miners)
        }
      }
    }
  }
  let flattened_all_miners = [].concat.apply([], all_miners)
  // console.log('flattened miners ' + flattened_all_miners)
  return flattened_all_miners
}

var _get_fix_target = function (objs) {
  var most_need = 1
  var target_now = null
  var pct = 0

  for (var key in objs) {
    var obj = Game.getObjectById(objs[key])
    // calculate most need
    if ((obj.structureType === STRUCTURE_RAMPART) || (obj.structureType === STRUCTURE_WALL)) {
      pct = (obj.hits / Memory.rooms[obj.room.name].wallHP)
    } else {
      pct = (obj.hits / obj.hitsMax)
    }

    if (pct < most_need) {
      most_need = pct
      target_now = obj.id
    }
  }
  if (target_now) {
    let obj = Game.getObjectById(target_now)
    let obj_life = (100 * most_need).toPrecision(6)
    let room_name = obj.room.name
    // console.log(room_name + '\t repair target ' + struct + '\t' + struct.pos.x + ', ' + struct.pos.y + '\t\t' + struct_life + '% - ' + struct.hits)
    console.log(`${room_name} \t heal target ${obj} \t ${obj.pos.x}, ${obj.pos.y} \t ${obj_life}% - ${obj.hits}`)
    return target_now
  }
}

var get_obj_id = function (obj) {
  return (obj.id) ? obj.id : null
}

module.exports = {
  archer: archer,
  booster: booster,
  builder: builder,
  claimer: claimer,
  enershifter: enershifter,
  enertrain: enertrain,
  fodder: fodder,
  guard: guard,
  harvester: harvester,
  healer: healer,
  linkling: linkling,
  miner: miner,
  mule: mule,
  remote_builder: remote_builder,
  remote_mule: remote_mule,
  remote_repairs: remote_repairs,
  repairs: repairs,
  scout: scout,
  striker: striker
}
