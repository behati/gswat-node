var binary = require('binary'),
    crypto = require('crypto')

var sequenceId = 0;

var protocol = module.exports = {
  create: function(command) {
    var cmd = commands(command),
    len = cmd.join('').length + 12 + (cmd.length * 5),
    b = new Buffer(len)

    sequenceId += 1;
    id = sequenceId
    commands[id] = {
      command: command,
      response: {}
    }
    b.writeInt32LE(id, 0)
    b.writeInt32LE(len, 4)
    b.writeInt32LE(cmd.length, 8)
    var off = 12;
    for (var x in cmd) {
      var c = cmd[x]
      b.writeInt32LE(c.length, off)
      b.write(c, off + 4)
      b[off + 4 + c.length] = 0x00;
      off += c.length + 5
    }
    return {buffer: b, id: id};

    function commands(command) {
      var cmd = [];
      var args = command.split(' ')
      switch (args[0]) {
        case 'admin.say':
          cmd[0] = args[0];
        cmd[1] = args.slice(1, (args.length - 1)).join(' ');
        cmd[2] = args[args.length - 1]
        break;
        default:
          cmd = args;
      }
      return cmd;
    }
  },
  parse: function(client, cb) {
    binary.stream(client)
    .loop(function(end) {
      this
      .word32le('id')
      .word32le('size')
      .word32le('wordCount')
      .tap(function(vars) {
        var response = {
          id: vars.id & 0x3fffffff,
          event: !!(vars.id & 0x80000000),
          isResponse: !!(vars.id & 0x40000000),
          size: vars.size,
          wordCount: vars.wordCount,
          words: []
        }
        this
        .buffer('words', response.size - 12)
        .tap(function(vars) {
          binary.parse(vars.words)
          .loop(function(_end) {
            this
            .word32le('wordLen')
            .buffer('word', 'wordLen')
            this.skip(1)
            .tap(function(vars) {
              response.words.push(vars.word.toString())
              if (response.words.length === response.wordCount) {
                _end()
              }
            })
          })
          .tap(function(vars) {
            cb(response)
          })
        })
      })
    })
  },
  types: function(response, command) {
    var obj, words = response.words, command = command || words[0];
    switch(command) {
      case 'admin.eventsEnabled':
        obj = {
          status: words[0]
        }
        if (words[1]) {
          obj.eventsEnabled = words[1]
        }
        return obj;
        break;
      case 'admin.password':
        obj = {
          status: words[0]
        }
        if (words[1]) {
          obj.password = words[1]
        }
        return obj;
        break;
      case 'admin.help':      // Lists all available admin commands
        obj = {
          status: words[0],
          availableCommands: words.slice(1, words.length).sort()
        }
        return obj;
        break;
      case 'login.hashed':    // attempts to authenticate with the server using a hashed pw
        obj = {
          status: words[0]
        }
        if (words[1]) {
          obj.salt = words[1]
        }
        return obj;
        break;
      case 'version':         // server version
        obj = {
          status: words[0],
          game: words[1],
          version: words[2]
        }
        return obj;
        break;
      case 'admin.serverInfo':     // returns a brief server info
      case 'serverInfo':
        var teams = parseInt(words[8]), scores = [];
        if (isNaN(teams)) {
          teams = -2;
        } else {
          for (var i = 0; i <= teams - 1; i += 1) {
            scores[i] = words[9 + i]
          }
        }
        obj = {
          status: words[0],
          serverName: words[1],
          playerCount: words[2],
          maxPlayers: words[3],
          gameMode: words[4],
          map: words[5],
          roundsPlayed: words[6],
          roundsTotal: words[7],
          scores: scores,
          onlineState: words[teams + 10],
          ranked: words[teams + 11],
          punkBuster: words[teams + 12],
          hasGamePassword: words[teams + 13],
          uptime: words[teams + 14],
          roundTime: words[teams + 15],
          ipAndPort: words[teams + 16],
          punkBusterVersion: words[teams + 17],
          queueEnabled: words[teams + 18],
          region: words[teams + 19],
          country: words[teams + 21]
        }
        return obj;
        break;
      case 'admin.listPlayers':
      case 'listPlayers':         // not working =/
        obj = {
          status: words[0]
        }
        var params = words[1];
        var players = words[parseInt(params) + 2];
        obj.players = [];
        for (var p = 0; p < players; p += 1) {
          var player = {};
          fillStats(player, p, function(player) {
            obj.players.push(player)
          })
        }
        function fillStats(player, p, cb) {
          var offset = ((p + 1) * parseInt(params)) + 3;
          for (var i = 0; i <= params - 1; i += 1) {
            player[words[2 + i].replace('Id', '')] = words[offset + i];
          }
          cb(player)
        }
        return obj;
        break;
      case 'punkBuster.isActive':    // untested
        obj = {
          status: words[0],
          active: words[1]
        }
        return obj;
        break;
      case 'punkBuster.onMessage':     // untested
        obj = {
          message: words[1]
        }
        return obj;
        break;
      case 'player.onSpawn':          // OnSpawn Event
        obj = {
          player: words[1],
          team: words[2],
          message: words[1] + ' spawned on team ' + words[2]
        }
        return obj;
        break;
      case 'player.onTeamChange':      // TeamChange event
        obj = {
          player: words[1],
          team: words[2],
          message: words[1] + ' changed to team ' + words[2]
        }
        return obj;
        break;
      case 'player.onSquadChange':    // SquadChange event
        obj = {
          player: words[1],
          team: words[2],
          squad: words[3],
          message: words[1] + ' changed to squad ' + words[3]
        }
        return obj;
        break;
      case 'player.onJoin':     // Join event
        obj = {
          player: words[1],
          guid: words[2]
        }
        return obj;
        break;
      case 'player.onAuthenticated':     // untested
        obj = {
          player: words[1]
        }
        return obj;
        break;
      case 'player.onLeave':          // untested
        var params = words[2];
        var offset = parseInt(params) + 4;
        obj = {};
        for (var i = 0; i <= params - 1; i += 1) {
          obj[words[3 + i].replace('Id', '')] = words[offset + i];
        }
        return obj;
        break;
        case 'player.onChat':    // OnPlayerChat Event, ideal for sockets! \m/
        obj = {
          player: words[1],
          chatMessage: words[2],
          message: words[1] + ': ' + words[2]
        }
        return obj;
        break;
      case 'player.onKill':   // OnKill event
        obj = {
          player: words[1],
          killed: words[2],
          weapon: words[3],
          headshot: words[4],
          message: words[1] + ' killed ' + words[2] + ' with ' + words[3] + ' (Headshot: ' + words[4] + ')'
        }
        return obj;
        break;
      case 'server.onLevelLoaded':    // untested
        obj = {
          map: words[1],
          gameMode: words[2],
          roundsPlayed: words[3],
          roundsTotal: words[4]
        }
        return obj;
        break;
      case 'server.onLevelLoaded':      // untested
        obj = {
          winningTeam: words[1]
        }
        return obj;
        break;
        case 'mapList.list':
            obj = {
                status: words[0],
                nummaps: parseInt(words[5]),
                maps: []
            }

            for (var i = 0; i < obj.nummaps; i += 1) {
                 obj.maps.push(words[3+i])
            }
        return obj;
        break;
        case 'vars.serverName':
            obj = {
                status: words[0],
                name: words[1]
            }
            return obj;
        break;
      default:
        obj = {
          status: words[0]
        }
        return obj;
    }
  },
  auth: function(rcon, password) {
    rcon.send('login.hashed', function(response) {
      var salt = '', _salt = response.salt

      for (var i=0; i < _salt.length; i+=2) {
        salt += unescape('%' + _salt.substr(i, 2))
      }

      var hashedPass = crypto.createHash('md5').update(salt).update(password).digest('hex').toUpperCase()
      rcon.send('login.hashed ' + hashedPass, function(response) {
        rcon.emit('authed', response)
      })
    })
  },
    /* BF3 Constants and flags enums */
  flags: {
      "SERVER_VARS": [
          "ranked",
          "gamePassword",
          "serverName",
          "autoBalance",
          "friendlyFire",
          "maxPlayers",
          "killCam",
          "miniMap",
          "hud",
          "3dSpotting",
          "miniMapSpotting",
          "nameTag",
          "3pCam",
          "regenerateHealth",
          "teamKillCountForKick",
          "teamKillValueForKick",
          "teamKillValueIncrease",
          "teamKillValueDecreasePerSecond",
          "teamKillKickForBan",
          "idleTimeout",
          "idleBanRounds",
          "roundStartPlayerCount",
          "roundRestartPlayerCount",
          "vehicleSpawnAllowed",
          "vehicleSpawnDelay",
          "soldierHealth",
          "playerRespawnTime",
          "playerManDownTime",
          "bulletDamage",
          "gameModeCounter",
          "onlySquadLeaderSpawn"
      ],
      "SERVER_PRESETS": {
          "Normal": {
              "autoBalance": true,
              "friendlyFire": false,
              "killCam": true,
              "miniMap": true,
              "hud": true,
              "3dSpotting": true,
              "miniMapSpotting": true,
              "nameTag": true,
              "3pCam": true,
              "regenerateHealth": true,
              "vehicleSpawnAllowed": true,
              "soldierHealth": 100,
              "playerRespawnTime": 100,
              "playerManDownTime": 100,
              "bulletDamage": 100,
              "onlySquadLeaderSpawn": false
          },
          "Hardcore": {
              "autoBalance": true,
              "friendlyFire": true,
              "killCam": false,
              "miniMap": true,
              "hud": false,
              "3dSpotting": false,
              "miniMapSpotting": true,
              "nameTag": false,
              "3pCam": false,
              "regenerateHealth": false,
              "vehicleSpawnAllowed": true,
              "soldierHealth": 60,
              "playerRespawnTime": 100,
              "playerManDownTime": 100,
              "bulletDamage": 100,
              "onlySquadLeaderSpawn": true
          },
          "Infantry Only": {
              "autoBalance": true,
              "friendlyFire": false,
              "killCam": true,
              "miniMap": true,
              "hud": true,
              "3dSpotting": true,
              "miniMapSpotting": true,
              "nameTag": true,
              "3pCam": false,
              "regenerateHealth": true,
              "vehicleSpawnAllowed": false,
              "soldierHealth": 100,
              "playerRespawnTime": 100,
              "playerManDownTime": 100,
              "bulletDamage": 100,
              "onlySquadLeaderSpawn": false
          }
      },
      "TEAMS": [
          "US",
          "RU"
      ],
      "SQUADS": [
          "Alpha",
          "Bravo",
          "Charlie",
          "Delta",
          "Echo",
          "Foxtrot",
          "Golf",
          "Hotel",
          "India",
          "Juliett",
          "Kilo",
          "Lima",
          "Mike",
          "November",
          "Oscar",
          "Papa",
          "Quebec",
          "Romeo",
          "Sierra",
          "Tango",
          "Uniform",
          "Victor",
          "Whiskey",
          "Xray",
          "Yankee",
          "Zulu"
      ],
      "MAPS": {
          "XP3_Alborz": "Alborz Mountains",
          "XP3_Shield": "Armored Shield",
          "XP4_Parl": "Azadi Palace",
          "XP3_Desert": "Bandar Desert",
          "MP_007": "Caspian Border",
          "MP_013": "Damavand Peak",
          "XP3_Valley": "Death Valley",
          "XP2_Palace": "Donya Fortress",
          "XP4_Quake": "Epicenter",
          "MP_001": "Grand Bazaar",
          "XP1_002": "Gulf of Oman",
          "MP_018": "Kharg Island",
          "XP5_003": "Kiasar Railroad",
          "XP4_FD": "Markaz Monolith",
          "XP5_002": "Nebandan Flats",
          "MP_017": "Noshahar Canals",
          "XP2_Office": "Operation 925",
          "MP_012": "Operation Firestorm",
          "MP_Subway": "Operation Metro",
          "XP5_001": "Operation Riverside",
          "XP5_004": "Sabalan Pipeline",
          "XP2_Factory": "Scrapmetal",
          "MP_011": "Seine Crossing",
          "XP1_003": "Sharqi Peninsula",
          "XP1_001": "Strike at Karkand",
          "XP4_Rubble": "Talah Market",
          "MP_003": "Teheran Highway",
          "XP1_004": "Wake Island",
          "XP2_Skybar": "Ziba Tower"
      },
      "GAME_MODES": {
          "AirSuperiority0": "Air Superiority",
          "CaptureTheFlag0": "Capture The Flag",
          "ConquestSmall0": "Conquest",
          "ConquestAssaultSmall0": "Conquest Assault",
          "ConquestAssaultSmall1": "Conquest Assault alt.2",
          "ConquestAssaultLarge0": "Conquest Assault Large",
          "Domination0": "Conquest Domination",
          "ConquestLarge0": "Conquest Large",
          "GunMaster0": "Gun Master",
          "RushLarge0": "Rush",
          "Scavenger0": "Scavenger",
          "SquadDeathMatch0": "Squad Deathmatch",
          "SquadRush0": "Squad Rush",
          "TeamDeathMatchC0": "TDM Close Quarters",
          "TankSuperiority0": "Tank Superiority",
          "TeamDeathMatch0": "Team Deathmatch"
      },
      "MAP_INFO": {
          "MP_018": {
              "ConquestLarge0":   [300, 300],
              "ConquestSmall0":   [200, 200],
              "RushLarge0":       [75, 75],
              "SquadRush0":       [20, 20],
              "SquadDeathMatch0": [50, 50],
              "TeamDeathMatch0":  [100, 100]
          }
      }
  }
}
