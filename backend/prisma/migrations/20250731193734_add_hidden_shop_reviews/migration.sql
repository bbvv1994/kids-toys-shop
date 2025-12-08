-- CreateTable
CREATE TABLE "HiddenShopReview" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "shopReviewId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HiddenShopReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HiddenShopReview_userId_shopReviewId_key" ON "HiddenShopReview"("userId", "shopReviewId");

-- AddForeignKey
ALTER TABLE "HiddenShopReview" ADD CONSTRAINT "HiddenShopReview_shopReviewId_fkey" FOREIGN KEY ("shopReviewId") REFERENCES "ShopReview"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiddenShopReview" ADD CONSTRAINT "HiddenShopReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
