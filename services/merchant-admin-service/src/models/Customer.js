import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({}, { strict: false });

const Customer = mongoose.model('Customer', customerSchema);
export default Customer;
