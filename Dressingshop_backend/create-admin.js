import dotenv from "dotenv";
import { connectDB, disconnectDB } from "./config/database.js";
import { User } from "./models/User.js";

dotenv.config();

const getRequiredEnv = (name) => {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const createAdminUser = async () => {
  try {
    await connectDB();

    const adminEmail = getRequiredEnv("ADMIN_EMAIL");
    const adminPassword = getRequiredEnv("ADMIN_PASSWORD");
    const adminFirstName = getRequiredEnv("ADMIN_FIRST_NAME");
    const adminLastName = getRequiredEnv("ADMIN_LAST_NAME");
    const adminPhone = getRequiredEnv("ADMIN_PHONE");

    await User.deleteOne({ email: adminEmail });
    console.log("Cleared any existing admin user");

    const adminUser = new User({
      firstName: adminFirstName,
      lastName: adminLastName,
      email: adminEmail,
      password: adminPassword,
      phone: adminPhone,
      role: "admin",
    });

    await adminUser.save();

    console.log("\nAdmin user created successfully");
    console.log("====================================");
    console.log(`Email: ${adminEmail}`);
    console.log("Password: set via ADMIN_PASSWORD");
    console.log("Role: admin");
    console.log("====================================");

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error("Admin user creation failed:", error);
    await disconnectDB();
    process.exit(1);
  }
};

createAdminUser();
