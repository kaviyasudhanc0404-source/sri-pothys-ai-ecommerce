import mongoose from "mongoose";

const DEFAULT_LOCAL_URI = "mongodb://127.0.0.1:27017/dressingshop";

const parseBoolean = (value) => {
  if (typeof value !== "string") return false;
  return ["1", "true", "yes", "y", "on"].includes(value.trim().toLowerCase());
};

const looksLikePlaceholderUri = (uri) => {
  if (!uri) return false;
  return /[<>\s]/.test(uri);
};

const isSrvDnsTxtBlockedError = (error) => {
  const message = String(error?.message || "");
  return error?.code === "EREFUSED" && (error?.syscall === "queryTxt" || message.includes("queryTxt"));
};

const connectOnce = async (uri, label) => {
  const serverSelectionTimeoutMS = Number(process.env.MONGOOSE_SERVER_SELECTION_TIMEOUT_MS || 10000);
  const connectTimeoutMS = Number(process.env.MONGOOSE_CONNECT_TIMEOUT_MS || 10000);
  const dbName = process.env.MONGODB_DB_NAME;

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS,
    connectTimeoutMS,
    socketTimeoutMS: 45000,
    ...(dbName ? { dbName } : {}),
  });

  console.log(`MongoDB connected (${label}) to ${mongoose.connection.host}/${mongoose.connection.name}`);
};

export const connectDB = async () => {
  try {
    // Fail fast if DB isn't reachable (prevents 10s "buffering timed out" errors)
    mongoose.set("bufferCommands", false);

    const primaryUri = process.env.MONGODB_URI;
    const allowFallback = parseBoolean(process.env.MONGODB_ALLOW_FALLBACK);
    const fallbackUri = allowFallback ? process.env.MONGODB_URI_FALLBACK || DEFAULT_LOCAL_URI : undefined;

    if (!primaryUri) {
      console.error(
        "MONGODB_URI is not configured. This backend is set to require MongoDB Atlas (or another remote MongoDB) and will not fall back to local by default."
      );
      console.error(
        "Set MONGODB_URI to your Atlas connection string. If you *really* want local fallback, set MONGODB_ALLOW_FALLBACK=true and MONGODB_URI_FALLBACK."
      );
      process.exit(1);
    }

    if (looksLikePlaceholderUri(primaryUri)) {
      console.error("MONGODB_URI looks invalid (contains spaces or <> placeholders).");
      console.error(
        "If your Atlas password contains special characters (like @, :, /, ?), it must be URL-encoded (e.g. @ -> %40)."
      );
      process.exit(1);
    }

    try {
      await connectOnce(primaryUri, "primary");
      return;
    } catch (primaryError) {
      console.error("MongoDB primary connection failed:", primaryError);

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

      console.error(
        "Not falling back to local MongoDB. To allow fallback, set MONGODB_ALLOW_FALLBACK=true and provide MONGODB_URI_FALLBACK."
      );
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
