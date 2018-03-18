var dev = !(process.env.NODE_ENV === 'production');

function throwEnviromentNotConfigured() {
    throw new Error("The application is not configured properly for a production enviroment. Edit /config/server.js to fix this problem!");
}

module.exports = {
    connectionString: dev ? "mongodb://localhost:27017/xwin" : throwEnviromentNotConfigured(),
    hostUrl: dev ? "http://localhost:3000" : throwEnviromentNotConfigured(),
    secret: "Dear diary, this is my biggest secret."
};