import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../domain/entities/user.entity';
import {
  IUserRepository,
  UserFilters,
} from '../../domain/repositories/user.repository';
import { UserDocument, User as UserSchema } from '../../schemas/user.schema';

@Injectable()
export class MongoUserRepository implements IUserRepository {
  constructor(
    @InjectModel(UserSchema.name)
    private userModel: Model<UserDocument>,
  ) { }

  async create(entity: User): Promise<void> {
    const snapshot = entity.toSnapshot();
    const doc = new this.userModel(snapshot);
    await doc.save();
  }

  async update(entity: User): Promise<void> {
    const snapshot = entity.toSnapshot();
    await this.userModel.updateOne({ id: snapshot.id }, snapshot);
  }

  async delete(id: string): Promise<void> {
    await this.userModel.deleteOne({ id });
  }

  async findById(id: string): Promise<User | null> {
    const doc = await this.userModel.findOne({ id }).exec();
    if (!doc) return null;
    const data = doc.toObject() as any;
    const docObj = doc as any;
    if (!data.created_at) {
      data.created_at = docObj.createdAt || new Date();
    }
    if (!data.updated_at) {
      data.updated_at = docObj.updatedAt || new Date();
    }
    if (!data.role) {
      data.role = 'user';
    }
    return User.rehydrate(data);
  }

  async findAll(params?: {
    pagination?: { page: number; limit: number };
    filters?: UserFilters;
  }): Promise<{ data: User[]; total: number }> {
    const query: any = {};
    if (params?.filters?.email) {
      query.email = new RegExp(params.filters.email, 'i');
    }
    if (params?.filters?.active !== undefined) {
      query.active = params.filters.active;
    }

    const docs = await this.userModel.find(query).exec();
    const total = await this.userModel.countDocuments(query).exec();

    return {
      data: docs.map((doc) => {
        const data = doc.toObject() as any;
        const docObj = doc as any;
        if (!data.created_at) {
          data.created_at = docObj.createdAt || new Date();
        }
        if (!data.updated_at) {
          data.updated_at = docObj.updatedAt || new Date();
        }
        if (!data.role) {
          data.role = 'user';
        }
        return User.rehydrate(data);
      }),
      total,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await this.userModel.findOne({ email }).exec();
    if (!doc) return null;
    const data = doc.toObject() as any;
    const docObj = doc as any;
    if (!data.created_at) {
      data.created_at = docObj.createdAt || new Date();
    }
    if (!data.updated_at) {
      data.updated_at = docObj.updatedAt || new Date();
    }
    if (!data.role) {
      data.role = 'user';
    }
    return User.rehydrate(data);
  }
}
