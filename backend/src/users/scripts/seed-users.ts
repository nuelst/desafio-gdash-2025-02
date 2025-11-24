import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { UserRole } from '../domain/entities/user-role.enum';
import { UsersService } from '../users.service';

interface SeedUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

const seedUsers: SeedUser[] = [
  {
    name: 'Administrador',
    email: 'admin@example.com',
    password: 'admin123',
    role: UserRole.ADMIN,
  },
  {
    name: 'João Silva',
    email: 'joao.silva@example.com',
    password: 'user123',
    role: UserRole.USER,
  },
  {
    name: 'Maria Santos',
    email: 'maria.santos@example.com',
    password: 'user123',
    role: UserRole.USER,
  },
  {
    name: 'Pedro Oliveira',
    email: 'pedro.oliveira@example.com',
    password: 'user123',
    role: UserRole.USER,
  },
  {
    name: 'Ana Costa',
    email: 'ana.costa@example.com',
    password: 'user123',
    role: UserRole.USER,
  },
];

async function seedUsersData() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const usersService = app.get(UsersService);

    console.log('🌱 Iniciando seed de usuários...\n');

    let created = 0;
    let skipped = 0;

    for (const userData of seedUsers) {
      try {
        const existingUser = await usersService.findByEmail(userData.email);

        if (existingUser) {
          console.log(`⏭️  Usuário ${userData.email} já existe, pulando...`);
          skipped++;
          continue;
        }

        await usersService.create({
          name: userData.name,
          email: userData.email,
          password: userData.password,
          role: userData.role,
        });

        console.log(
          `✅ Usuário criado: ${userData.name} (${userData.email}) - Role: ${userData.role}`,
        );
        created++;
      } catch (error: any) {
        console.error(
          `❌ Erro ao criar usuário ${userData.email}:`,
          error.message,
        );
      }
    }

    console.log(`\n📊 Resumo:`);
    console.log(`   ✅ Criados: ${created}`);
    console.log(`   ⏭️  Pulados: ${skipped}`);
    console.log(`   📝 Total: ${seedUsers.length}`);

    console.log('\n🔐 Credenciais dos usuários criados:');
    seedUsers.forEach((user) => {
      console.log(`   ${user.email} / ${user.password} (${user.role})`);
    });
  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

seedUsersData();
