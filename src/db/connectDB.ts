import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  // use when starting application locally
  const mongoUrlLocal: any = process.env.MONGO_URL;

  // use when starting application as docker container
  const mongoUrlDocker: string = "mongodb://admin:password@mongodb";

  try {
    // Establish connection to the database
    const connection = await mongoose.connect(mongoUrlLocal);

    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (err: any) {
    console.error(`Error ${err.message}`);
    process.exit(1);
  }
};

// Export connectDB
export default connectDB;
