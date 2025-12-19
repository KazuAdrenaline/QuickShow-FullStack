import { clerkClient } from "@clerk/express";

export const protectAdmin = async (req, res, next) => {
  try {
    const { userId } = req.auth();
    const user = await clerkClient.users.getUser(userId);

    if (user.privateMetadata.role !== "admin") {
      return res.json({ success: false, message: "not authorized" });
    }

    next();
  } catch (error) {
    return res.json({ success: false, message: "not authorized" });
  }
};

export const protectRoute = async (req, res, next) => {
  try {
    const { userId } = req.auth();

    if (!userId) {
      return res.json({ success: false, message: "Please login" });
    }

    next();
  } catch (error) {
    return res.json({ success: false, message: "Not authenticated" });
  }
};
