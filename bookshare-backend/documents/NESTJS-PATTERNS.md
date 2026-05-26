# NestJS Patterns Skill

## Mission
Guide implementation of NestJS applications following framework best practices, architectural patterns, and SOLID principles.

## Core Principles
- **Modular Architecture**: Organize code by domain/feature
- **Dependency Injection**: Leverage NestJS DI system
- **Type Safety**: Full TypeScript strict mode
- **Separation of Concerns**: Controllers → Services → Repositories
- **Single Responsibility**: One class, one reason to change

## NestJS Module Structure
```
src/
  core/                      # Cross-cutting concerns
    guards/
    pipes/
    interceptors/
    decorators/
  common/                    # Shared utilities
    constants/
    utils/
    exceptions/
  modules/
    auth/                    # Feature module
      controllers/
      services/
      repositories/
      entities/
      dtos/
      auth.module.ts
    users/
    books/
    ...
  app.module.ts
  main.ts
```

## Controller Responsibilities
- ✅ Accept HTTP requests
- ✅ Call service methods
- ✅ Return responses
- ✅ Validate request via pipes

```typescript
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
```

## Service Responsibilities
- ✅ Business logic
- ✅ Data manipulation
- ✅ Validation rules
- ✅ Integration with repositories
- ❌ Never handle HTTP details

```typescript
@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Validation, business logic
    return this.usersRepository.create(createUserDto);
  }
}
```

## Repository Responsibilities
- ✅ Database access only
- ✅ Query building
- ✅ Data persistence
- ❌ Never contain business logic

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

  async create(data: CreateUserDto): Promise<UserEntity> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }
}
```

## DTO (Data Transfer Object)
```typescript
export class CreateUserDto {
  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;

  @IsString()
  name: string;
}
```

## Common Patterns

### Guards (Authentication/Authorization)
```typescript
@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    return !!request.user;
  }
}
```

### Pipes (Validation/Transformation)
```typescript
@Injectable()
export class TrimPipe implements PipeTransform {
  transform(value: string): string {
    return typeof value === 'string' ? value.trim() : value;
  }
}
```

### Interceptors (Logging/Response Transformation)
```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    console.log('Before...');
    return next.handle().pipe(
      tap(() => console.log('After...')),
    );
  }
}
```

## Error Handling

```typescript
import { HttpException, HttpStatus } from '@nestjs/common';

throw new BadRequestException('Invalid data');
throw new NotFoundException('Resource not found');
throw new UnauthorizedException('Invalid credentials');
throw new ForbiddenException('Access denied');
throw new ConflictException('Already exists');
throw new InternalServerErrorException('Database error');

// Custom exception
throw new HttpException('Custom error', HttpStatus.CUSTOM_CODE);
```

## Testing Pattern
- Use `@nestjs/testing`
- Test services with mocked repositories
- Test controllers with mocked services
- Test full integration with test database

## Configuration Management
- `.env` files for environment variables
- `config` service for type-safe access
- Separate configs per environment

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
  ],
})
export class AppModule {}
```

## Database Integration (TypeORM)
```typescript
@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;
}

// In module
@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
  ],
})
export class UsersModule {}
```

## Quality Checklist
- ✅ All layers have clear responsibilities
- ✅ Dependency injection properly configured
- ✅ No circular dependencies
- ✅ Proper error handling
- ✅ Full test coverage
- ✅ TypeScript strict mode enabled
- ✅ No magic strings/numbers (use constants)
