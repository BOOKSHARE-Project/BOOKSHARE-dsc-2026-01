import { Controller, Delete, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { LoansService } from './modules/loans/services/loans.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly loansService: LoansService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
@Delete(':id')
  async remove(@Param('id') id: string) {
    return this.loansService.remove(id);
  }
}
