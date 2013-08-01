/* General configuration @todo move to a relational database of sorts */
module.exports = {
options: {
    game: 'bf3',   // RCON protocol to load
    ServerIP: 'yourserverip',
    ServerPort: 47200,
    Password: 'yourserverpassword',
    watchEvents: true,    // enable events for chat, kills etc.
    reconnect: false   // disables automatic reconnect
}
}
