import { IsString, IsIn } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsString()
  @IsIn(['Pending', 'Accepted', 'En Route', 'Arrived', 'Payment Received', 'Completed'], { message: 'Invalid order status' })
  status!: string;
}
