const cron = require('node-cron');

const task = cron.schedule('* * * * *', '../tasks/demoCronJobTask.js');

task.on('execution:started', (ctx) => {
    console.log('Execution started at', ctx.date, 'Reason:', ctx.execution?.reason);
});

task.on('execution:finished', (ctx) => {
    console.log('Execution finished. Result:', ctx.execution?.result);
});

task.on('execution:failed', (ctx) => {
    console.error('Execution failed with error:', ctx.execution?.error?.message);
});

task.on('execution:maxReached', (ctx) => {
    console.warn(`Task "${ctx.task?.id}" reached max executions.`);
});