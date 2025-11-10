function calculateReward(activities) {
    const workouts = activities.summary?.activities || [];
    const rewardPerWorkout = 2.0; // Beispiel: 2€ pro Training
    return workouts.length * rewardPerWorkout;
}

module.exports = { calculateReward };
