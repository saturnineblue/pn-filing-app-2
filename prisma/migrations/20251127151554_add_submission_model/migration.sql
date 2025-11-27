-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "orderName" TEXT NOT NULL,
    "trackingNumber" TEXT NOT NULL,
    "documentId" TEXT,
    "pncNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pncRetrievedAt" TIMESTAMP(3),
    "errorMessage" TEXT,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Submission_orderName_idx" ON "Submission"("orderName");

-- CreateIndex
CREATE INDEX "Submission_submittedAt_idx" ON "Submission"("submittedAt");

-- CreateIndex
CREATE INDEX "Submission_status_idx" ON "Submission"("status");
