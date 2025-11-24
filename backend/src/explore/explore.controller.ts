import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CityWithWeather,
  ExploreCitiesResponse,
  ExploreService,
} from './explore.service';

@ApiTags('Explore')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('explore')
export class ExploreController {
  constructor(private readonly exploreService: ExploreService) {}

  @Get('cities')
  @ApiOperation({
    summary: 'Listar cidades com clima',
    description:
      'Lista cidades do mundo com informações climáticas atuais. Suporta busca e paginação.',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Buscar cidades por nome',
    example: 'São Paulo',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número da página',
    example: 1,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Itens por página',
    example: 20,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de cidades com clima',
    type: Object,
  })
  async getCities(
    @Query('search') search?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ): Promise<ExploreCitiesResponse> {
    return this.exploreService.searchCities(search, page, limit);
  }

  @Get('cities/:geonameId')
  @ApiOperation({
    summary: 'Detalhes de uma cidade',
    description:
      'Retorna informações detalhadas e clima atual de uma cidade específica.',
  })
  @ApiParam({
    name: 'geonameId',
    description: 'ID GeoNames da cidade',
    example: 3448439,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Detalhes da cidade com clima',
    type: Object,
  })
  @ApiResponse({
    status: 404,
    description: 'Cidade não encontrada',
  })
  async getCityDetail(
    @Param('geonameId', ParseIntPipe) geonameId: number,
  ): Promise<CityWithWeather | null> {
    return this.exploreService.getCityDetail(geonameId);
  }
}
