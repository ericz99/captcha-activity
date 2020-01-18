const path = require('path');

// # parse task json
const taskConfig = require(path.join(__dirname, '..', '..', 'task.json'));

// # import instance class
const Instance = require('../libs/instance');

// # launch all task from task config
function startAll() {
    const tasks = [];

    taskConfig.forEach(task => {
        const { email, password, ...rest } = task;
        tasks.push(new Instance(email, password, rest).spawnInstance());
    });

    return Promise.all(tasks);
}

module.exports = {
    startAll
}