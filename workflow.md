# dependencies

yarn add: express cors dotenv mongoose bcrypt joi jsonwebtoken multer

# notes

1.0. no user can make borrows if they have an overdue book in their list.
->correct createBorrowController,createBorrowForUserController

1.1 make createBorrowController,createBorrowForUserController
-->make sure, user cannot book the same bookId if that bookId is already in my borrows list, and with status "borrowed" or "overdue"
