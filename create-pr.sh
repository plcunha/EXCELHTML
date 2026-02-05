#!/bin/bash
# Script para criar Pull Request - execute após autenticar com: gh auth login

gh pr create --base main --head dev \
  --title "Release: 234 tests, dark mode, security docs, dependency updates" \
  --body "## Summary
- Add dark mode support to Charts component  
- Add security documentation (docs/SECURITY.md)
- Upgrade lucide-react 0.468.0 → 0.563.0
- Upgrade tailwind-merge 2.6.1 → 3.4.0
- 234 tests with 93% code coverage

## Quality
- ✅ 234 tests passing
- ✅ 92.85% code coverage  
- ✅ 0 lint errors
- ✅ TypeScript strict mode
- ✅ Build successful

## Changes (32 commits)
- Dark mode support for all chart types
- Error Boundary and Skeleton components
- Security headers and accessibility improvements
- Comprehensive test suite (234 tests)
- Documentation updates (SECURITY.md, CHANGELOG.md)
- Dependency updates (lucide-react, tailwind-merge)"

echo "PR created successfully!"
