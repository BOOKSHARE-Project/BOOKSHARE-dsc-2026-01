# TDD Workflow Skill

## Mission
Enable developers to implement features using Test-Driven Development (TDD), ensuring high code quality through systematic test-first approach.

## Core Principles
- **Test First**: Write tests before implementation
- **Red-Green-Refactor**: Follow the TDD cycle strictly
- **Small Increments**: Make minimal changes per cycle
- **Fast Feedback**: Keep test suites fast for rapid iteration

## Key Responsibilities
1. Guide developers through Red-Green-Refactor cycle
2. Ensure test coverage for all features
3. Validate code quality through automated tests
4. Refactor safely with test coverage

## Guidelines

### Red Phase
- Write failing test that captures expected behavior
- Test should be minimal and focused
- Verify test actually fails before moving to Green
- Test file naming: `.test.ts`, `.spec.ts`

### Green Phase
- Write minimum code to make test pass
- No over-engineering or premature optimization
- All tests must pass
- Focus on functionality, not performance

### Refactor Phase
- Improve code quality with tests as safety net
- Extract duplications
- Improve readability and maintainability
- All tests must still pass after refactoring

### Test Organization
```
src/
  feature/
    feature.ts              # Implementation
    feature.test.ts         # Unit tests
    integration.test.ts     # Integration tests
```

### Quality Criteria
- ✅ All tests pass (unit + integration)
- ✅ Test coverage ≥ 80% for new code
- ✅ No skipped tests (@skip.todo should be avoided)
- ✅ Clear test descriptions using Given-When-Then
- ✅ No code duplication between tests

### Test Structure Template
```typescript
describe('Feature Name', () => {
  // Given: Setup phase
  let module: TestingModule;
  
  beforeEach(async () => {
    module = await Test.createTestingModule({...}).compile();
  });

  it('should [expected behavior] when [condition]', async () => {
    // Given: Initial state
    const input = {...};
    
    // When: Action
    const result = await service.method(input);
    
    // Then: Assertion
    expect(result).toBe(expected);
  });
});
```

### Common Pitfalls to Avoid
- ❌ Writing tests after implementation
- ❌ Over-testing (testing implementation details)
- ❌ Weak test assertions
- ❌ Slow tests (mock external dependencies)
- ❌ Tightly coupled tests

## Integration with NestJS
- Use `@nestjs/testing` for module testing
- Mock external services and databases
- Test HTTP endpoints with `supertest`
- Validate guards, pipes, and interceptors

## Commands Reference
```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:cov           # Coverage report
npm run test:debug         # Debug mode
```

## Quality Gate
- ✅ No failing tests
- ✅ Coverage report generated
- ✅ All refactoring complete
- ✅ Code review approved
