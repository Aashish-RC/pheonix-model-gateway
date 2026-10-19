import { SSRFGuard, createFakeDnsResolver } from '../src/security/ssrf.js';

// Hermetic testing: Set fake DNS resolver for all test suites so tests pass offline
SSRFGuard.setResolver(createFakeDnsResolver());
