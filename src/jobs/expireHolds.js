import cron from "node-cron";
import {
  getExpiredActiveHoldsModel,
  expireHoldModel,
} from "../models/Hold/HoldModel.js";
import { releaseBookCopyModel } from "../models/Book/BookModel.js";

export const startExpireHoldsJob = () => {
  // Production: every day at 3:00 AM server time
  // "0 3 * * *"
  cron.schedule("0 3 * * *", async () => {
    try {
      const expired = await getExpiredActiveHoldsModel();

      let releasedCount = 0;

      for (const h of expired) {
        const updated = await expireHoldModel(h._id);

        if (updated) {
          await releaseBookCopyModel(updated.bookId);
          releasedCount++;
        }
      }

      console.log(
        `[EXPIRE-HOLDS] Expired ${expired.length}, released ${releasedCount} copies`
      );
    } catch (err) {
      console.error("[EXPIRE-HOLDS] Failed:", err.message);
    }
  });
};
