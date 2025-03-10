import {
  ArticleKind,
  ClientSalutation,
  OfferStatus,
  OrderStatus,
  OverdueNoticeLevel,
  OverdueNoticePaymentStatus,
  PaymentStatus,
} from "./appTypes";

interface CreatedAtUpdatedAt {
  created_at: number;
  updated_at: number;
}

export interface Article extends CreatedAtUpdatedAt {
  id: string;
  kind: ArticleKind;
  title: string;
  description: string;
  unit?: string;
  price?: number;
}
export interface Client extends CreatedAtUpdatedAt {
  id: string;
  salutation?: ClientSalutation;
  email?: string;
  landline_phone?: string;
  company_name?: string;
  birthday?: string;
  comment?: string;
  mobile_phone?: string;
  first_name?: string;
  last_name?: string;
  postal_code?: string;
  city?: string;
  street_and_number?: string;
  orders?: Order[];
}

export interface Order extends CreatedAtUpdatedAt {
  id: string;
  client_id: string;
  client: Client;
  offer?: Offer;
  invoices?: Invoice[];
  overdue_notices?: OverdueNotice[];
  status: OrderStatus;
  title: string;
  description: string;
  can_have_cash_discount: boolean;
  discount_duration: number;
  discount_percentage: number;
}

export interface Invoice extends CreatedAtUpdatedAt {
  id: number;
  order_id: string;
  order: Order;
  sub_id: string;
  service_dates: string[];
  invoice_date: string;
  payment_target: string;
  status: PaymentStatus;
  description: string;
  items: InvoiceItem[];
}

export interface OrderItem {
  id: number;
  kind: ArticleKind;
  title: string;
  description: string;
  unit?: string;
  price?: number;
  amount?: number;
}

export interface OfferItem extends OrderItem {
  offer_id: number;
  offer: Offer;
}

export interface InvoiceItem extends OrderItem {
  invoice_id: number;
  invoice: Invoice;
}

export interface Offer extends CreatedAtUpdatedAt {
  id: number;
  order_id: string;
  order: Order;
  status: OfferStatus;
  description: string;
  offered_at: string;
  offer_valid_until: string;
  items: OfferItem[];
  documents: OfferDocument[];
}

interface BaseDocument extends CreatedAtUpdatedAt {
  id: string;
  creation_date: string;
  client_id: string;
  client_email?: string;
  client_company_name?: string;
  client_first_name?: string;
  client_last_name?: string;
  client_street_and_number?: string;
  client_postal_code?: string;
  client_city?: string;
  order_id: string;
  order_title: string;
}

export interface OfferDocument extends BaseDocument {
  offer_id: number;
  items: OfferDocumentItem[];
  offered_at: string;
  offer_valid_until: string;
}

export interface InvoiceDocument extends BaseDocument {
  invoice_id: number;
  items: InvoiceDocumentItem[];
  invoice_date: string;
  service_dates: string[];
  payment_target: string;
  can_have_cash_discount: boolean;
  discount_duration: number;
  discount_percentage: number;
}

export interface OverdueNoticeDocument extends BaseDocument {
  overdue_notice_id: number;
  notice_level: OverdueNoticeLevel;
  notice_date: string;
  payments_until: string;
  payment_target: string;
  notice_costs: number;
  default_interest: number;
  invoice_documents: InvoiceDocument[];
}

interface DocumentItem {
  id: number;
  kind: ArticleKind;
  title: string;
  description: string;
  unit?: string;
  price?: number;
  amount?: number;
}

export interface OfferDocumentItem extends DocumentItem {
  offer_document_id: string;
}

export interface InvoiceDocumentItem extends DocumentItem {
  invoice_document_id: string;
}

export interface OverdueNotice extends CreatedAtUpdatedAt {
  id: number;
  order_id: string;
  order: Order;
  invoice_documents: InvoiceDocument[];
  sub_id: string;
  description: string;
  notice_date: string;
  payments_until: string;
  payment_target: string;
  notice_level: OverdueNoticeLevel;
  payment_status: OverdueNoticePaymentStatus;
  notice_costs: number;
  default_interest: number;
}
