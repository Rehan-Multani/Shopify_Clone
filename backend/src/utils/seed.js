import { connectDB } from '../config/db.js';
import mongoose from 'mongoose';
import Plan from '../models/Plan.js';
import User from '../models/User.js';

const PLANS = [
  {
    name: 'Basic', slug: 'basic', monthlyPrice: 29, yearlyPrice: 24,
    trialDays: 3, sortOrder: 1,
    features: ['Online store', 'Up to 1000 products', '24/7 support'],
    limits: { products: 1000, staffAccounts: 2, storage: 5 },
    transactionFeePercent: 2,
  },
  {
    name: 'Plus', slug: 'plus', monthlyPrice: 79, yearlyPrice: 65,
    trialDays: 3, sortOrder: 2, isFeatured: true,
    features: ['Everything in Basic', 'Up to 10000 products', 'Professional reports'],
    limits: { products: 10000, staffAccounts: 5, storage: 50 },
    transactionFeePercent: 1,
  },
  {
    name: 'Advanced', slug: 'advanced', monthlyPrice: 299, yearlyPrice: 249,
    trialDays: 3, sortOrder: 3,
    features: ['Everything in Plus', 'Unlimited products', 'Advanced report builder'],
    limits: { products: -1, staffAccounts: 15, storage: 200 },
    transactionFeePercent: 0.5,
  },
];

const run = async () => {
  await connectDB();

  for (const p of PLANS) {
    await Plan.updateOne({ slug: p.slug }, { $set: p }, { upsert: true });
  }
  console.log(`[seed] Plans upserted: ${PLANS.length}`);

  const adminEmail = 'admin@storify.local';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: 'Master Admin',
      email: adminEmail,
      password: 'admin12345',
      role: 'master_admin',
      isEmailVerified: true,
    });
    console.log(`[seed] Master admin created: ${adminEmail} / admin12345`);
  } else {
    console.log(`[seed] Master admin already exists: ${adminEmail}`);
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
