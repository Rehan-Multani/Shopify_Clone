import mongoose from 'mongoose';
import { registerEmailConfigModels } from '../../../shared/emailConfigModels.js';

const { EmailDeliveryLog } = registerEmailConfigModels(mongoose);
export { EmailDeliveryLog };
export default EmailDeliveryLog;
