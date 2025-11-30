require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Team = require('./models/Team');
const Task = require('./models/Task');

const run = async () => {
  try {
    await connectDB();
    await mongoose.connection.dropDatabase();
    const alice = new User({ name: 'Alice', email: 'alice@example.com', password: 'password' });
    const bob = new User({ name: 'Bob', email: 'bob@example.com', password: 'password' });
    const charlie = new User({ name: 'Charlie', email: 'charlie@example.com', password: 'password' });
    await alice.save();
    await bob.save();
    await charlie.save();

    const team = new Team({ name: 'Demo Team', description: 'A simple demo team', members: [alice._id, bob._id, charlie._id], owner: alice._id });
    await team.save();

    const t1 = new Task({ title: 'Setup project', description: 'Initialize repository and toolchain', team: team._id, assignees: [alice._id], status: 'todo', priority: 'high', createdBy: alice._id });
    const t2 = new Task({ title: 'Design Kanban', description: 'Create columns and basic UI', team: team._id, assignees: [bob._id], status: 'inprogress', priority: 'medium', createdBy: bob._id });
    const t3 = new Task({ title: 'Add authentication', description: 'Secure REST endpoints', team: team._id, assignees: [charlie._id], status: 'todo', priority: 'high', createdBy: charlie._id });

    await t1.save();
    await t2.save();
    await t3.save();

    console.log('Seed data created.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
