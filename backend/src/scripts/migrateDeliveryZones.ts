import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const migrateDeliveryZones = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/shawarma';
    await mongoose.connect(mongoURI);
    
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db!;
    const collection = db.collection('deliveryzones');

    // Drop the old city_1 index
    try {
      await collection.dropIndex('city_1');
      console.log('✅ Dropped old city_1 index');
    } catch (error: any) {
      if (error.code === 27) {
        console.log('ℹ️  Index city_1 does not exist, skipping');
      } else {
        console.error('Error dropping index:', error.message);
      }
    }

    // Delete all existing zones (since schema changed)
    const deleteResult = await collection.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} old delivery zones`);

    console.log('✅ Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
};

migrateDeliveryZones();
