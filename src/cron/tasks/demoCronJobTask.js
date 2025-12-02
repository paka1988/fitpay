// ./tasks/my-task.js
exports.task = (ctx) => {
    console.log(`Task started at ${ctx.triggeredAt.toISOString()}`);
    console.log(`Scheduled for: ${ctx.dateLocalIso}`);
    console.log('Task status: ' + JSON.stringify(ctx.task.getStatus()))
    return 'Hello from background task!';
};