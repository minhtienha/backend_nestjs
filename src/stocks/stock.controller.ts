import { Controller } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Roles } from 'src/auth/guards/roles.decorator';
import { Role } from '../auth/guards/role.enum';
import { Patch, Param, Body } from '@nestjs/common';
import { StockService } from './stock.service';

@Controller('stocks')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @UseGuards(AuthGuard)
  @Roles(Role.Admin)
  @Patch(':id')
  updateStock(@Param('id') id: string, @Body('quantity') quantity: number) {
    return this.stockService.updateStock(id, quantity);
  }
}
