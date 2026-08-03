import mongoose from 'mongoose';
import { registerEmailConfigModels } from '../../../shared/emailConfigModels.js';

const { VendorEmailConfig } = registerEmailConfigModels(mongoose);
export { VendorEmailConfig };
export default VendorEmailConfig;
