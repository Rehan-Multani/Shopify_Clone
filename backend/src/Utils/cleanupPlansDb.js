import connectDB from '../Config/db.js';
import Plan from '../Models/Plan.js';
import dotenv from 'dotenv';

dotenv.config();

const cleanupDb = async () => {
    try {
        await connectDB();
        
        console.log('Updating all plan documents in database to remove productsCount and vendorsLimit fields...');
        
        // $unset removes the fields from existing documents in the collection
        const result = await Plan.updateMany(
            {}, 
            { $unset: { productsCount: "", vendorsLimit: "" } }
        );
        
        console.log(`Database cleanup successful! Modified documents count: ${result.modifiedCount}`);
        process.exit(0);
    } catch (error) {
        console.error('Error cleaning up DB:', error);
        process.exit(1);
    }
};

cleanupDb();
