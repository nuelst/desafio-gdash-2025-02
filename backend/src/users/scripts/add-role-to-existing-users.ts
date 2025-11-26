import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from '../../app.module';
import { UserRole } from '../domain/entities/user-role.enum';
import { User, UserDocument } from '../schemas/user.schema';

async function addRoleToExistingUsers() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));

    const result = await userModel.updateMany(
      { role: { $exists: false } },
      { $set: { role: UserRole.USER } },
    );

    console.log(
      `✅ ${result.modifiedCount} usuário(s) atualizado(s) com role 'user'`,
    );

    const adminEmail = process.env.DEFAULT_USER_EMAIL || 'admin@example.com';
    const adminResult = await userModel.updateOne(
      { email: adminEmail },
      { $set: { role: UserRole.ADMIN } },
    );

    if (adminResult.modifiedCount > 0) {
      console.log(`✅ Usuário admin (${adminEmail}) definido com role 'admin'`);
    }
  } catch (error) {
    console.error('❌ Erro ao atualizar usuários:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

addRoleToExistingUsers();
