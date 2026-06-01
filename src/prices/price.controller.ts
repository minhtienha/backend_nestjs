import { Controller } from '@nestjs/common';
import { PriceService } from './price.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Roles } from 'src/auth/guards/roles.decorator';
import { Role } from '../auth/guards/role.enum';
import { Patch, Param, Body } from '@nestjs/common';

@Controller('prices')
export class PriceController {
  constructor(private readonly priceService: PriceService) {}

  @UseGuards(AuthGuard)
  @Roles(Role.Admin)
  @Patch(':id')
  updatePrice(@Param('id') id: string, @Body('price') price: number) {
    return this.priceService.updatePrice(id, price);
  }
}
