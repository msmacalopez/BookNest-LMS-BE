import cron from "node-cron";
import {
  getExpiredEbookBorrowsModel,
  autoReturnBorrowModel,
} from "../models/Borrow/BorrowHistoryModel.js";
import { releaseBookCopyModel } from "../models/Book/BookModel.js";

export const startAutoReturnEbooksJob = () => {
  // Runs every day at 3:00 AM server time
  //TODO
  //PRODUCTION: "0 3 * * *"
  //TESTING: "* * * * *"
  cron.schedule("* * * * *", async () => {
    try {
      const expired = await getExpiredEbookBorrowsModel();

      for (const b of expired) {
        const updated = await autoReturnBorrowModel(b._id);

        // only release if it successfully changed status
        if (updated) {
          await releaseBookCopyModel(updated.bookId);
        }
      }

      console.log(`[AUTO-RETURN] Returned ${expired.length} expired ebooks`);
    } catch (err) {
      console.error("[AUTO-RETURN] Failed:", err.message);
    }
  });
};
//TEST: autoReturnEbooks,helper.js and CreateMyBorrowontroller (BorrowRecord)
