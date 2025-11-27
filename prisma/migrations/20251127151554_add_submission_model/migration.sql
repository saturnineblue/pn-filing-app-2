-- CreateTable (if not exists - baseline existing tables)
CREATE TABLE IF NOT EXISTS "Product" (
    "id" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "productCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable (if not exists - baseline existing tables)
CREATE TABLE IF NOT EXISTS "Settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable (new table)
CREATE TABLE IF NOT EXISTS "Submission" (
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

-- CreateIndex (if not exists)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Product_nickname_key') THEN
        CREATE UNIQUE INDEX "Product_nickname_key" ON "Product"("nickname");
    END IF;
END $$;

-- CreateIndex (if not exists)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Settings_key_key') THEN
        CREATE UNIQUE INDEX "Settings_key_key" ON "Settings"("key");
    END IF;
END $$;

-- CreateIndex (if not exists)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Submission_orderName_idx') THEN
        CREATE INDEX "Submission_orderName_idx" ON "Submission"("orderName");
    END IF;
END $$;

-- CreateIndex (if not exists)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Submission_submittedAt_idx') THEN
        CREATE INDEX "Submission_submittedAt_idx" ON "Submission"("submittedAt");
    END IF;
END $$;

-- CreateIndex (if not exists)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Submission_status_idx') THEN
        CREATE INDEX "Submission_status_idx" ON "Submission"("status");
    END IF;
END $$;
