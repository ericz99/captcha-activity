const colors = require('colors/safe');

const Logger = function Logger(email) {
    this.email = email;
}

Logger.prototype.green = function success(message) {
    displayLog(colors.green(message), { email: this.email });
};

Logger.prototype.red = function error(message) {
    displayLog(colors.red(message), { email: this.email });
};

Logger.prototype.blue = function info(message) {
    displayLog(colors.blue(message), { email: this.email });
};

Logger.prototype.yellow = function warn(message) {
    displayLog(colors.yellow(message), { email: this.email });
};

Logger.prototype.white = function normal(message) {
    displayLog(message, { email: this.email });
};

function displayLog(message, { email }) {
    console.log(`[${email}] [${new Date().toISOString()}] ${message}`);
}

module.exports = function (email) {
    return new Logger(email);
}