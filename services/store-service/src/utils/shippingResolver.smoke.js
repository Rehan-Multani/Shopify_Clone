/**
 * node services/store-service/src/utils/shippingResolver.smoke.js
 */
import { mapShiprocketStatus } from '../services/shippingService.js';

const assert = (c, m) => { if (!c) throw new Error(m); };

assert(mapShiprocketStatus('DELIVERED').orderStatus === 'delivered', 'delivered');
assert(mapShiprocketStatus('OUT FOR DELIVERY').orderStatus === 'out_for_delivery', 'ofd');
assert(mapShiprocketStatus('SHIPPED').orderStatus === 'shipped', 'shipped');
assert(mapShiprocketStatus('UNKNOWN').orderStatus === null, 'unknown');

console.log('shippingResolver.smoke.js — mapShiprocketStatus passed');
