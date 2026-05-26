# Copilot Instructions - BOOKSHARE Project

Guidelines para GitHub Copilot VS Code ao trabalhar no projeto BOOKSHARE.

## TDD Workflow

### Red-Green-Refactor Cycle
1. **Red**: Escrever teste que FALHA para capturar comportamento esperado
2. **Green**: Escrever código mínimo para fazer teste PASSAR
3. **Refactor**: Melhorar código com testes como rede de segurança

### Padrão de Testes
- Naming: `*.test.ts`, `*.spec.ts`
- Estrutura: Given-When-Then (Setup → Action → Assert)
- Cobertura: ≥ 80% para novo código
- Mock: Dependências externas (DB, APIs)

### Exemplo
```typescript
describe('UserService', () => {
  it('should return user when ID exists', async () => {
    // Given
    const userId = 1;
    
    // When
    const result = await userService.findById(userId);
    
    // Then
    expect(result).toBeDefined();
  });
});
```

## NestJS Patterns

### Arquitetura em 3 Camadas
```
Controller → Service → Repository
   (HTTP)   (Lógica)  (Dados)
```

### Controller
- ✅ Aceita requisições HTTP
- ✅ Chama serviços
- ✅ Retorna respostas
- ❌ Nunca contém lógica de negócio

```typescript
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findById(id);
  }
}
```

### Service
- ✅ Lógica de negócio
- ✅ Validações
- ✅ Integração com repositórios
- ❌ Nunca HTTP, queries DB direto

```typescript
@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
```

### Repository
- ✅ Acesso a dados apenas
- ✅ Queries ao banco
- ❌ Lógica de negócio

```typescript
@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(UserEntity)
    private repository: Repository<UserEntity>,
  ) {}

  async findById(id: number): Promise<UserEntity | null> {
    return this.repository.findOneBy({ id });
  }
}
```

## Qualidade

### Checklist Antes de Commit
- ✅ Todos testes passam (`pnpm test`)
- ✅ Cobertura OK (`pnpm run test:cov`)
- ✅ Sem testes skipados
- ✅ Sem código duplicado
- ✅ Separação de responsabilidades clara
- ✅ TypeScript strict mode

### Comandos Úteis
```bash
pnpm test              # Rodar testes
pnpm run test:watch   # Watch mode
pnpm run test:cov     # Cobertura
pnpm run test:debug   # Debug
```

## Referências Completas
- TDD Workflow: `TDD-WORKFLOW.md`
- NestJS Patterns: `NESTJS-PATTERNS.md`
