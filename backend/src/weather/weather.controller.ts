import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  ParseFloatPipe,
  ParseIntPipe,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WeatherLogResponseDto } from '../shared/swagger/dto/weather-log-response.dto';
import {
  ApiCreatedResponseWithModel,
  ApiOkResponseWithModel,
  ApiStandardResponses,
} from '../shared/swagger/swagger.decorators';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { WeatherService } from './weather.service';

@ApiTags('Weather')
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) { }

  @Post('logs')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar log de clima',
    description:
      'Endpoint usado pelo worker Go para enviar dados climáticos coletados. Não requer autenticação.',
  })
  @ApiCreatedResponseWithModel(WeatherLogResponseDto, 'Log criado com sucesso')
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  async create(@Body() createWeatherLogDto: CreateWeatherLogDto) {
    return this.weatherService.create(createWeatherLogDto);
  }

  @Get('logs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar logs climáticos',
    description:
      'Retorna uma lista paginada de registros climáticos. Permite filtrar por localização.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número da página (padrão: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Itens por página (padrão: 50)',
    example: 50,
  })
  @ApiQuery({
    name: 'location',
    required: false,
    type: String,
    description: 'Filtrar por localização (busca parcial)',
    example: 'São Paulo',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Data inicial (ISO 8601)',
    example: '2024-01-01T00:00:00Z',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Data final (ISO 8601)',
    example: '2024-01-31T23:59:59Z',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de logs climáticos',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/WeatherLogResponseDto' },
        },
        total: { type: 'number', example: 100 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 50 },
      },
    },
  })
  @ApiStandardResponses()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('location') location?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.weatherService.findAll(pageNum, limitNum, location, startDate, endDate);
  }

  @Get('latest')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obter último registro climático',
    description:
      'Retorna o registro climático mais recente. Opcionalmente filtra por localização.',
  })
  @ApiQuery({
    name: 'location',
    required: false,
    type: String,
    description: 'Filtrar por localização',
    example: 'São Paulo',
  })
  @ApiOkResponseWithModel(WeatherLogResponseDto, 'Último registro encontrado')
  @ApiResponse({
    status: 404,
    description: 'Nenhum registro encontrado',
  })
  @ApiStandardResponses()
  async findLatest(@Query('location') location?: string) {
    return this.weatherService.findLatest(location);
  }

  @Get('locations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar localizações disponíveis',
    description:
      'Retorna uma lista de todas as localizações únicas disponíveis nos registros climáticos.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de localizações',
    schema: {
      type: 'array',
      items: { type: 'string' },
      example: ['São Paulo, BR', 'Luanda, Angola'],
    },
  })
  @ApiStandardResponses()
  async getLocations() {
    return this.weatherService.getLocations();
  }

  @Get('insights')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obter insights de clima com IA',
    description:
      'Gera insights climáticos usando IA (Google Gemini). Analisa dados históricos e retorna texto natural e personalizado. Se a IA não estiver disponível, usa fallback automático com regras estatísticas. O campo "generatedBy" indica qual método foi usado.',
  })
  @ApiQuery({
    name: 'location',
    required: false,
    type: String,
    description: 'Filtrar por localização',
    example: 'São Paulo',
  })
  @ApiResponse({
    status: 200,
    description: 'Insights gerados com sucesso',
    schema: {
      example: {
        insights: 'O clima está bastante agradável! Com 25°C de média e umidade em 65%, está perfeito para atividades ao ar livre. A temperatura vem subindo gradualmente, então aproveite enquanto não esquenta demais. Recomendação: leve água e protetor solar se for sair durante o dia!',
        generatedBy: 'ai',
        dataPoints: 72,
        location: 'São Paulo, BR'
      }
    }
  })
  @ApiStandardResponses()
  async getInsights(@Query('location') location?: string) {
    return this.weatherService.getInsights(location);
  }

  @Get('export.csv')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Exportar dados em CSV',
    description:
      'Exporta os dados climáticos em formato CSV. Opcionalmente filtra por localização.',
  })
  @ApiQuery({
    name: 'location',
    required: false,
    type: String,
    description: 'Filtrar por localização',
    example: 'São Paulo',
  })
  @ApiResponse({
    status: 200,
    description: 'Arquivo CSV',
    content: {
      'text/csv': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiStandardResponses()
  async exportCSV(@Res() res: Response, @Query('location') location?: string) {
    const csv = await this.weatherService.exportToCSV(location);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=weather-data.csv',
    );
    res.send(csv);
  }

  @Get('export.xlsx')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Exportar dados em XLSX',
    description:
      'Exporta os dados climáticos em formato Excel (XLSX). Opcionalmente filtra por localização.',
  })
  @ApiQuery({
    name: 'location',
    required: false,
    type: String,
    description: 'Filtrar por localização',
    example: 'São Paulo',
  })
  @ApiResponse({
    status: 200,
    description: 'Arquivo XLSX',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiStandardResponses()
  async exportXLSX(@Res() res: Response, @Query('location') location?: string) {
    const buffer = await this.weatherService.exportToXLSX(location);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=weather-data.xlsx',
    );
    res.send(buffer);
  }

  @Get('forecast')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obter previsão climática',
    description:
      'Retorna previsão climática para os próximos dias usando a API Open-Meteo.',
  })
  @ApiQuery({
    name: 'latitude',
    required: true,
    type: Number,
    description: 'Latitude da localização',
    example: -23.55052,
  })
  @ApiQuery({
    name: 'longitude',
    required: true,
    type: Number,
    description: 'Longitude da localização',
    example: -46.6333,
  })
  @ApiQuery({
    name: 'location',
    required: true,
    type: String,
    description: 'Nome da localização',
    example: 'São Paulo, BR',
  })
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    description: 'Número de dias de previsão (padrão: 10, máximo: 16)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Previsão climática',
    type: Object,
  })
  @ApiStandardResponses()
  async getForecast(
    @Query('latitude', new ParseFloatPipe()) latitude: number,
    @Query('longitude', new ParseFloatPipe()) longitude: number,
    @Query('location') location: string,
    @Query('days', new ParseIntPipe({ optional: true })) days: number = 10,
  ) {
    return this.weatherService.getForecast(latitude, longitude, location, days);
  }
}
