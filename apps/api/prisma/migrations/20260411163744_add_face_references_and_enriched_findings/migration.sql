-- DropIndex
DROP INDEX "idx_findings_ownership";

-- AlterTable
ALTER TABLE "action_approvals" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "actions" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "audit_logs" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "case_assignments" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "cases" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "families" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "finding_evidence" ALTER COLUMN "sha256" SET DATA TYPE TEXT,
ALTER COLUMN "captured_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "findings" ADD COLUMN     "confidence_score" INTEGER,
ADD COLUMN     "duplicate_group_id" UUID,
ADD COLUMN     "match_score" INTEGER,
ADD COLUMN     "matching_metadata" JSONB,
ADD COLUMN     "source_type" TEXT,
ADD COLUMN     "source_url" TEXT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "guardians" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "legal_mandates" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "minors" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "notifications" ALTER COLUMN "read_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "role_assignments" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "sessions" ALTER COLUMN "revoked_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "expires_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- CreateTable
CREATE TABLE "face_representations" (
    "id" UUID NOT NULL,
    "case_id" UUID NOT NULL,
    "minor_id" UUID NOT NULL,
    "reference_type" TEXT NOT NULL,
    "normalized_vector" JSONB NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "face_representations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "face_representations_case_id_minor_id_idx" ON "face_representations"("case_id", "minor_id");

-- CreateIndex
CREATE INDEX "action_approvals_action_id_idx" ON "action_approvals"("action_id");

-- CreateIndex
CREATE INDEX "audit_logs_object_type_object_id_created_at_idx" ON "audit_logs"("object_type", "object_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "guardians_family_id_idx" ON "guardians"("family_id");

-- CreateIndex
CREATE INDEX "legal_mandates_minor_id_status_idx" ON "legal_mandates"("minor_id", "status");

-- CreateIndex
CREATE INDEX "minors_family_id_idx" ON "minors"("family_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_read_at_idx" ON "notifications"("user_id", "read_at");

-- CreateIndex
CREATE INDEX "role_assignments_user_id_role_idx" ON "role_assignments"("user_id", "role");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- RenameIndex
ALTER INDEX "idx_actions_finding_status" RENAME TO "actions_finding_id_status_idx";

-- RenameIndex
ALTER INDEX "idx_case_assignments_case_user" RENAME TO "case_assignments_case_id_user_id_idx";

-- RenameIndex
ALTER INDEX "idx_cases_family_status" RENAME TO "cases_family_id_status_idx";

-- RenameIndex
ALTER INDEX "idx_evidence_finding_status" RENAME TO "finding_evidence_finding_id_status_idx";

-- RenameIndex
ALTER INDEX "idx_findings_case_status" RENAME TO "findings_case_id_status_idx";
