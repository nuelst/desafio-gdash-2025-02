import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserResponseDto } from '../shared/swagger/dto/user-response.dto';
import {
  ApiConflictResponseStandard,
  ApiCreatedResponseWithModel,
  ApiNotFoundResponseStandard,
  ApiOkResponseWithModel,
  ApiStandardResponses,
} from '../shared/swagger/swagger.decorators';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar novo usuário',
    description: 'Cria um novo usuário no sistema. O email deve ser único.',
  })
  @ApiCreatedResponseWithModel(UserResponseDto, 'Usuário criado com sucesso')
  @ApiConflictResponseStandard()
  @ApiStandardResponses()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos os usuários',
    description: 'Retorna uma lista de todos os usuários cadastrados.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários',
    schema: {
      type: 'array',
      items: {
        $ref: '#/components/schemas/UserResponseDto',
      },
    },
  })
  @ApiStandardResponses()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obter usuário por ID',
    description: 'Retorna os dados de um usuário específico pelo ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do usuário',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponseWithModel(UserResponseDto, 'Usuário encontrado')
  @ApiNotFoundResponseStandard()
  @ApiStandardResponses()
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar usuário',
    description:
      'Atualiza os dados de um usuário. Campos não fornecidos não serão alterados.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do usuário',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponseWithModel(UserResponseDto, 'Usuário atualizado com sucesso')
  @ApiNotFoundResponseStandard()
  @ApiConflictResponseStandard()
  @ApiStandardResponses()
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Remover usuário',
    description: 'Remove um usuário do sistema permanentemente.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do usuário',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário removido com sucesso',
  })
  @ApiNotFoundResponseStandard()
  @ApiStandardResponses()
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
