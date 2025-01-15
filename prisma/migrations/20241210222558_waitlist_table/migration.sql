-- CreateTable
CREATE TABLE "WaitList" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "bookId" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WaitList_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WaitList" ADD CONSTRAINT "WaitList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaitList" ADD CONSTRAINT "WaitList_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
