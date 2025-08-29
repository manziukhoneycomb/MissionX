export interface InvoiceItem {
  id: string;
  lineNumber: number;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  vendorName: string;
  vendorAddress: string;
  vendorPhone: string;
  vendorEmail: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  customerEmail: string;
  subtotal: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  terms: string;
  items: InvoiceItem[];
}

export interface AskAboutDataDto {
  query: string;
}

export interface AskAboutDataResponseDto {
  response: string;
  sql?: string;
  rawResult?: unknown;
  image?: string; // base64 encoded image
  error?: string;
}
