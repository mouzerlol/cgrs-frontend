# Run All Tests and Fix Failures

## Overview
Execute the full test suite for the CGRS frontend project and systematically fix any failures, ensuring code quality and functionality. This command uses Vitest with React Testing Library and jsdom.

## Project Context
- **Test Framework**: Vitest v2.0
- **Testing Library**: React Testing Library + Jest DOM
- **Environment**: jsdom
- **Test Files**: `src/**/*.test.{ts,tsx}`
- **Setup File**: `src/test/setup.ts`
- **Alias**: `@` → `src/`

## Steps

### 1. Run Test Suite
- Execute `npx vitest run` to run all tests
- Capture output and identify failures
- Check both unit and integration tests

### 2. Analyze Failures
- Categorize failures by type:
  - **Flaky**: Intermittent failures that may pass on re-run
  - **Broken**: Tests with syntax errors or import issues
  - **Functional**: Tests failing due to code bugs
- Prioritize fixes based on impact and scope
- Check if failures are related to recent changes using git status

### 3. Fix Issues Systematically
- Start with the most critical failures (blocking issues)
- Fix one issue at a time to avoid compound errors
- Re-run tests after each fix using `npx vitest run`
- Document fixes and any test updates needed

## Commands
```bash
# Run all tests
npx vitest run

# Run with coverage
npx vitest run --coverage

# Run specific test file
npx vitest run src/lib/api/__tests__/news.test.ts

# Watch mode for development
npx vitest
```

## Common Fixes
- **Import errors**: Check path aliases and module resolution
- **Render failures**: Verify test setup and provider configuration
- **Assertion failures**: Review expected vs actual values
- **Async issues**: Ensure proper await usage and cleanup
