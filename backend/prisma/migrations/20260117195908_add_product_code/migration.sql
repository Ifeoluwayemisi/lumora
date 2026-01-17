-- AlterTable
ALTER TABLE "Code" ADD COLUMN     "productId" TEXT;

-- AddForeignKey
ALTER TABLE "Code" ADD CONSTRAINT "Code_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
