import { ClientSalutation, OrderStatus } from "@/global/types/appTypes";

export function getClientMock() {
  return {
    id: "K" + String(Math.random() * 1_000_000),
    created_at: 1743838005.988,
    updated_at: 1743838005.189,
    salutation: ClientSalutation.mister,
    email: "email9@local.com",
    landline_phone: "+49 1111 9",
    company_name: "Company 9",
    birthday: "2021-01-09",
    comment: "Comment 9",
    mobile_phone: "+49 222 9",
    first_name: "First Name 9",
    last_name: "Last Name 9",
    postal_code: "postal code 9",
    city: "city 9",
    street_and_number: "street and number 9",
  };
}

export function getOrderMock() {
  return {
    id: "A" + String(Math.random() * 1_000_000),
    created_at: 1743840260.87,
    updated_at: 1743840260.87,
    client_id: "K9",
    status: OrderStatus.offer,
    title: "the-title",
    description: "the-description",
    can_have_cash_discount: false,
    discount_duration: 7,
    discount_percentage: 0,
  };
}
