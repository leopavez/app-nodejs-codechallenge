import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CreateTransactionUseCase } from '../../application/uses-cases/create-transaction/create-transaction.usecase';
import { GetTransactionByIdUseCase } from '../../application/uses-cases/get-transaction-by-id/get-transaction-by-id.usecase';
import {
  CreateTransactionDto,
  TransactionResponseDto,
} from '../../application/dto/transaction.dto';

@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly getTransactionByIdUseCase: GetTransactionByIdUseCase,
  ) {}

  @Post()
  async createTransaction(
    @Body() createTransactionDto: CreateTransactionDto,
  ): Promise<TransactionResponseDto> {
    try {
      return await this.createTransactionUseCase.execute(createTransactionDto);
    } catch (error) {
      throw new HttpException(
        `Error creating transaction: ${error instanceof Error ? error.message : 'Unexpected error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getTransaction(
    @Param('id') id: string,
  ): Promise<TransactionResponseDto> {
    try {
      return await this.getTransactionByIdUseCase.execute(id);
    } catch (error) {
      throw new HttpException(
        `Error getting transaction: ${error instanceof Error ? error.message : 'Unexpected error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
