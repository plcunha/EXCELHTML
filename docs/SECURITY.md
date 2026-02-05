# Security Notes

## Known Vulnerabilities (as of 2026-02-05)

### 1. Next.js (Moderate Severity)
- **Issue**: Unbounded Memory Consumption via PPR Resume Endpoint
- **Advisory**: https://github.com/advisories/GHSA-5f7q-jpqc-wp7h
- **Current Version**: 15.5.12
- **Fix**: Upgrade to Next.js 16.x (breaking change)
- **Status**: ⚠️ Requires major version upgrade

### 2. xlsx / SheetJS (High Severity)
- **Issues**: 
  - Prototype Pollution (https://github.com/advisories/GHSA-4r6h-8v6p-xvw6)
  - Regular Expression Denial of Service (https://github.com/advisories/GHSA-5pgg-2g8v-p4x9)
- **Current Version**: Latest available
- **Fix**: No fix available from maintainers
- **Status**: ⚠️ No upstream fix
- **Mitigation**: Input validation on uploaded files, file size limits

## Recommendations

1. **Short-term**: Monitor for xlsx security patches
2. **Medium-term**: Consider migration to Next.js 16 when stable
3. **Long-term**: Evaluate alternative Excel parsing libraries (e.g., exceljs)

## Audit History

| Date       | Vulnerabilities | Notes |
|------------|-----------------|-------|
| 2026-02-05 | 2 (1 mod, 1 high) | xlsx has no fix available |

## Running Security Checks

```bash
npm audit                    # Check for vulnerabilities
npm audit fix               # Auto-fix where possible
npm audit fix --force       # Force fixes (may cause breaking changes)
```
