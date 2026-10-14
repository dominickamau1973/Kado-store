import mongoose from "mongoose";
import { setServers } from "node:dns";

const connectDB = async () => {
  try {
    // Optional fix for MongoDB Atlas SRV DNS errors.
    const dnsServers = (process.env.MONGODB_DNS_SERVERS || "")
      .split(",")
      .map((server) => server.trim())
      .filter(Boolean);

    if (dnsServers.length > 0) {
      setServers(dnsServers);

      console.log(`MongoDB DNS servers configured: ${dnsServers.join(", ")}`);
    }

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not configured.");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);

    process.exit(1);
  }
};

export default connectDB;
