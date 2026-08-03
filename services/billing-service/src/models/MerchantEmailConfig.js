import mongoose from 'mongoose';
import { registerEmailConfigModels } from '../../../shared/emailConfigModels.js';

const { MerchantEmailConfig } = registerEmailConfigModels(mongoose);
export { MerchantEmailConfig };
export default MerchantEmailConfig;
