# CustomsCity API v2 Integration Implementation

## Phase 1: API Endpoint Corrections ✅ COMPLETED
- [x] Update submission endpoint in lib/customscity-api.ts
- [x] Fix base URL consistency in app/api/check-pnc/route.ts
- [x] Update PNC retrieval endpoint to PN v2

## Phase 2: Testing & Validation
- [ ] Test single order submission
- [ ] Test batch submission
- [ ] Test PNC retrieval
- [ ] Verify CSV export unchanged

## Phase 3: Production Deployment ⏳ READY
- [ ] Set CUSTOMSCITY_API_KEY in production .env.local
- [ ] Obtain valid PN v2 API credentials from CustomsCity
- [ ] Test with sandbox environment first
- [ ] Deploy to production with monitoring
