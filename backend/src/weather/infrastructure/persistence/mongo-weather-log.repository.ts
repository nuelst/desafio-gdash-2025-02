import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherLog } from '../../domain/entities/weather-log.entity';
import {
  IWeatherLogRepository,
  WeatherLogFilters,
} from '../../domain/repositories/weather-log.repository';
import {
  WeatherLogDocument,
  WeatherLog as WeatherLogSchema,
} from '../../schemas/weather-log.schema';

@Injectable()
export class MongoWeatherLogRepository implements IWeatherLogRepository {
  constructor(
    @InjectModel(WeatherLogSchema.name)
    private weatherLogModel: Model<WeatherLogDocument>,
  ) { }

  async create(entity: WeatherLog): Promise<void> {
    const snapshot = entity.toSnapshot();
    const doc = new this.weatherLogModel(snapshot);
    await doc.save();
  }

  async update(entity: WeatherLog): Promise<void> {
    const snapshot = entity.toSnapshot();
    await this.weatherLogModel.updateOne({ id: snapshot.id }, snapshot);
  }

  async delete(id: string): Promise<void> {
    await this.weatherLogModel.deleteOne({ id });
  }

  async findById(id: string): Promise<WeatherLog | null> {
    const doc = await this.weatherLogModel.findOne({ id }).exec();
    if (!doc) return null;
    const data = doc.toObject() as any;
    const docObj = doc as any;
    if (!data.created_at) {
      data.created_at = docObj.createdAt || new Date();
    }
    if (!data.updated_at) {
      data.updated_at = docObj.updatedAt || new Date();
    }
    return WeatherLog.rehydrate(data);
  }

  async findAll(params?: {
    pagination?: { page: number; limit: number };
    filters?: WeatherLogFilters;
  }): Promise<{ data: WeatherLog[]; total: number }> {
    const page = params?.pagination?.page || 1;
    const limit = params?.pagination?.limit || 50;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (params?.filters?.location) {
      query.location = new RegExp(params.filters.location, 'i');
    }

    if (params?.filters?.startDate || params?.filters?.endDate) {
      query.timestamp = {};
      if (params.filters.startDate) {
        query.timestamp.$gte = params.filters.startDate;
      }
      if (params.filters.endDate) {
        const endDate = new Date(params.filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        query.timestamp.$lte = endDate.toISOString();
      }
    }

    const [docs, total] = await Promise.all([
      this.weatherLogModel
        .find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.weatherLogModel.countDocuments(query).exec(),
    ]);

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
        return WeatherLog.rehydrate(data);
      }),
      total,
    };
  }

  async findLatest(location?: string): Promise<WeatherLog | null> {
    const query: any = {};
    if (location) {
      query.location = new RegExp(location, 'i');
    }

    const doc = await this.weatherLogModel
      .findOne(query)
      .sort({ timestamp: -1 })
      .exec();
    if (!doc) return null;
    const data = doc.toObject() as any;
    const docObj = doc as any;
    if (!data.created_at) {
      data.created_at = docObj.createdAt || new Date();
    }
    if (!data.updated_at) {
      data.updated_at = docObj.updatedAt || new Date();
    }
    return WeatherLog.rehydrate(data);
  }

  async findDistinctLocations(): Promise<string[]> {
    try {
      const locations = await this.weatherLogModel.distinct('location').exec();
      const filtered = locations
        .filter((loc): loc is string => Boolean(loc))
        .sort();
      return filtered;
    } catch (error) {
      console.error('Erro ao buscar localizações distintas:', error);
      return [];
    }
  }
}
