export type Status = 'scheduled' | 'in_service' | 'parts_waiting' | 'ready' | 'delivered';
export type PaymentType = 'cash' | 'card' | 'open';
export type ReminderType = 'appointment' | 'parts_waiting' | 'ready' | 'maintenance';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  created_at: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  customer_id: string;
  status: Status;
  created_at: string;
  updated_at: string;
}

export interface RepairOrder {
  id: string;
  vehicle_id: string;
  customer_id: string;
  status: Status;
  scheduled_at: string | null;
  work_order_no: string;
  notes: string | null;
  part_cost: number;
  labor_cost: number;
  paid_amount: number;
  payment_type: PaymentType;
  debt_amount: number;
  is_closed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  repair_order_id: string | null;
  description: string;
  amount: number;
  category: 'part' | 'labor' | 'other';
  incurred_at: string;
}

export interface Reminder {
  id: string;
  vehicle_id: string;
  type: ReminderType;
  title: string;
  due_at: string;
  is_done: boolean;
  created_at: string;
}

export interface PaymentLedger {
  id: string;
  order_id: string;
  customer_id: string;
  amount: number;
  payment_type: PaymentType;
  note: string | null;
  paid_at: string;
}
