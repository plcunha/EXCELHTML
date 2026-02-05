# Security Notes

## Known Vulnerabilities (as of 2026-02-05)

### 1. Next.js (Moderate Severity)
- **Issue**: Unbounded Memory Consumption via PPR Resume Endpoint
- **Advisory**: https://github.com/advisories/GHSA-5f7q-jpqc-wp7h
- **Current Version**: 15.5.12
- **Fix**: Upgrade to Next.js 16.x (breaking change)
- **Status**: ⚠️ Requires major version upgrade

### 2. xlsx / SheetJS (High Severity) ⚠️ CRITICAL
- **Issues**: 
  - **CVE-2023-30533**: Prototype Pollution (CVSS 7.8 High)
    - https://github.com/advisories/GHSA-4r6h-8v6p-xvw6
  - **CVE-2024-22363**: Regular Expression Denial of Service (ReDoS)
    - https://github.com/advisories/GHSA-5pgg-2g8v-p4x9
- **Current Version**: 0.18.5
- **Status**: ⚠️ **NO FIX AVAILABLE ON NPM**

#### Root Cause Analysis
The `xlsx` package on npm (SheetJS CE) is **no longer maintained**. The maintainers moved development to their own CDN and stopped publishing updates to npm.

- **Last npm publish**: 0.18.5 (4 years ago)
- **Actual latest version**: 0.20.2 (available only via https://cdn.sheetjs.com/)
- **Fix for CVE-2024-22363**: Included in 0.20.2, but NOT on npm

#### Impact Assessment
| Vulnerability | Impact | Attack Vector |
|--------------|--------|---------------|
| Prototype Pollution | Code execution, data manipulation | Malicious .xlsx file upload |
| ReDoS | Denial of service, CPU exhaustion | Malicious .xlsx file upload |

#### Current Mitigations in Place
1. **File size limit**: 10MB max upload (prevents large ReDoS payloads)
2. **Server-side validation**: File type checking before processing
3. **Isolated parsing**: Excel parsing runs in isolated context

#### Recommended Actions

**Option A: Install from SheetJS CDN (Quick Fix)**
```bash
# Remove npm version
npm uninstall xlsx

# Install from CDN (version 0.20.2 has CVE-2024-22363 fix)
npm install https://cdn.sheetjs.com/xlsx-0.20.2/xlsx-0.20.2.tgz
```
⚠️ Note: CDN version still has Prototype Pollution vulnerability (CVE-2023-30533)

**Option B: Migrate to ExcelJS (Recommended)**
```bash
npm uninstall xlsx
npm install exceljs
```

| Feature | xlsx | exceljs |
|---------|------|---------|
| Read XLSX | ✅ | ✅ |
| Write XLSX | ✅ | ✅ |
| Read CSV | ✅ | ✅ |
| Active Maintenance | ❌ (npm abandoned) | ✅ (MIT license) |
| Security Updates | ❌ | ✅ |
| Weekly Downloads | ~5M | ~3.3M |
| Bundle Size | 7.5 MB | 21.8 MB |

**Migration Effort**: Medium
- Replace `XLSX.read()` with `exceljs.Workbook.xlsx.load()`
- Update data extraction logic
- Test all upload scenarios

**Option C: Use read-excel-file (Lightweight Alternative)**
```bash
npm install read-excel-file
```
- Browser-focused, lightweight (~1MB)
- Good for simple parsing use cases
- MIT license, actively maintained

## Recommendations

1. **Immediate** (today): Add input sanitization layer before xlsx parsing
2. **Short-term** (this week): Migrate to ExcelJS or install from CDN
3. **Medium-term**: Consider migration to Next.js 16 when stable
4. **Long-term**: Full migration to ExcelJS with comprehensive testing

## Audit History

| Date       | Vulnerabilities | Notes |
|------------|-----------------|-------|
| 2026-02-05 | 2 (1 mod, 1 high) | xlsx has no fix available on npm; CDN has partial fix |

## Running Security Checks

```bash
npm audit                    # Check for vulnerabilities
npm audit fix               # Auto-fix where possible
npm audit fix --force       # Force fixes (may cause breaking changes)
```

## References

- [SheetJS Security Advisories](https://git.sheetjs.com/sheetjs/sheetjs/issues)
- [ExcelJS Documentation](https://github.com/exceljs/exceljs)
- [OSV Vulnerability Database](https://osv.dev/vulnerability/GHSA-4r6h-8v6p-xvw6)
- [npm trends: exceljs vs xlsx](https://npmtrends.com/exceljs-vs-xlsx)
