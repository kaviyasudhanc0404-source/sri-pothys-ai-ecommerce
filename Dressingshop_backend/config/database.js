import mongoose from "mongoose";

const DEFAULT_LOCAL_URI = "mongodb://127.0.0.1:27017/dressingshop";

const isSrvDnsTxtBlockedError = (error) => {
  const message = String(error?.message || "");
  return error?.code === "EREFUSED" && (error?.syscall === "queryTxt" || message.includes("queryTxt"));
};

const connectOnce = async (uri, label) => {
  const serverSelectionTimeoutMS = Number(process.env.MONGOOSE_SERVER_SELECTION_TIMEOUT_MS || 10000);
  const connectTimeoutMS = Number(process.env.MONGOOSE_CONNECT_TIMEOUT_MS || 10000);

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS,
    connectTimeoutMS,
    socketTimeoutMS: 45000,
  });

  console.log(`MongoDB connected (${label}) to ${mongoose.connection.host}/${mongoose.connection.name}`);
};

export const connectDB = async () => {
  try {
    // Fail fast if DB isn't reachable (prevents 10s "buffering timed out" errors)
    mongoose.set("bufferCommands", false);

    const primaryUri = process.env.MONGODB_URI;
    const fallbackUri = process.env.MONGODB_URI_FALLBACK || DEFAULT_LOCAL_URI;

    if (!primaryUri) {
      console.warn("MONGODB_URI is not configured. Falling back to local MongoDB.");
      await connectOnce(fallbackUri, "fallback");
      return;
    }

    try {
      await connectOnce(primaryUri, "primary");
      return;
    } catch (primaryError) {
      if (isSrvDnsTxtBlockedError(primaryError)) {
        console.error(
          "MongoDB Atlas SRV DNS lookup failed (queryTxt EREFUSED). This usually means your DNS/network blocks SRV/TXT lookups. " +
            "Fix by using a non-SRV connection string (mongodb://...) or switch DNS, or use a local MongoDB instance."
        );
      }

      if (fallbackUri && fallbackUri !== primaryUri) {
        console.warn("Primary MongoDB connection failed. Trying fallback URI...");
        await connectOnce(fallbackUri, "fallback");
        return;
      }

      throw primaryError;
    }
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  } catch (error) {
    console.error("MongoDB disconnection error:", error);
  }
};
