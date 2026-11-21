import { mount, shallowMount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

import DocumentArticleTable from "@/components/documents/DocumentArticleTable.vue";
import DocumentInvoiceItemTable from "@/components/documents/DocumentInvoiceItemTable.vue";
import DocumentText from "@/components/documents/DocumentText.vue";
import DocumentTitle from "@/components/documents/DocumentTitle.vue";
import OverdueNoticeEdit from "@/components/orders/OverdueNoticeEdit.vue";
import SubOrderPositions from "@/components/orders/SubOrderPositions.vue";
import {
  ArticleKind,
  DocumentKind,
  OverdueNoticeLevel,
  OverdueNoticePaymentStatus,
} from "@/global/types/appTypes";
import type {
  InvoiceDocument,
  Order,
  OverdueNotice,
  OverdueNoticeDocument,
} from "@/global/types/entities";

vi.mock("@/composables/useNotifications", () => ({
  default: () => ({ showNotification: vi.fn() }),
}));
vi.mock("@/composables/useConfirmations", () => ({
  default: () => ({ showConfirmation: vi.fn() }),
}));

const invoice: InvoiceDocument = {
  id: "invoice-1",
  created_at: 0,
  updated_at: 0,
  creation_date: "2026-01-01",
  client_id: "client-1",
  client_country: "AT",
  client_vat_id: "ATU12345",
  client_reverse_vat: true,
  order_id: "order-1",
  order_title: "Project",
  invoice_id: 1,
  items: [
    {
      id: 1,
      invoice_document_id: "invoice-1",
      kind: ArticleKind.item,
      title: "Work",
      description: "",
      amount: 2,
      price: 50,
    },
    {
      id: 2,
      invoice_document_id: "invoice-1",
      kind: ArticleKind.heading,
      title: "Note",
      description: "",
    },
  ],
  invoice_date: "2026-01-01",
  service_dates: ["2026-01-01"],
  payment_target: "2026-01-15",
  can_have_cash_discount: false,
  discount_duration: 0,
  discount_percentage: 0,
};

describe("reverse charge", () => {
  it("uses document snapshots for recipient, tax columns, totals and invoice notice", async () => {
    const props = { document: invoice, kind: DocumentKind.invoice as const };
    const table = mount(DocumentArticleTable, { props });
    const rows = table.findAll(".item-table tbody tr");
    expect(
      rows[0]
        .findAll("td")
        .slice(5)
        .map((cell) => cell.text()),
    ).toEqual(["-", "-", "-"]);
    expect(
      rows[1]
        .findAll("td")
        .slice(5)
        .map((cell) => cell.text()),
    ).toEqual(["", "", ""]);
    expect(
      table
        .findAll(".sum-table tbody tr")[1]
        .findAll("td")
        .map((cell) => cell.text()),
    ).toEqual(["100,00 €", "-", "-"]);

    const title = mount(DocumentTitle, { props: { result: invoice, kind: DocumentKind.invoice } });
    expect(title.text()).toContain("Österreich");
    expect(title.text()).toContain("USt-IdNr.: ATU12345");
    const text = mount(DocumentText, { props: { result: invoice, kind: DocumentKind.invoice } });
    expect(table.text()).toContain(
      "Steuerschuldnerschaft des Leistungsempfängers (Reverse Charge)",
    );
    expect(table.text()).toContain(
      "Die Rechnung enthält keine Umsatzsteuer, da die Steuerschuldnerschaft auf den Leistungsempfänger übergeht.",
    );
    expect(text.text()).not.toContain("Steuerschuldnerschaft des Leistungsempfängers");

    await table.setProps({ document: { ...invoice, client_reverse_vat: false } });
    expect(table.findAll(".sum-table tbody tr")[1].text()).toContain("119,00");
    expect(table.findAll(".item-table tbody tr")[0].findAll("td")[5].text()).toBe("19 %");
    await text.setProps({ result: { ...invoice, client_reverse_vat: false } });
    expect(table.text()).not.toContain("Steuerschuldnerschaft des Leistungsempfängers");
  });

  it("uses the PDF country mapping and hides domestic country codes", async () => {
    const title = mount(DocumentTitle, { props: { result: invoice, kind: DocumentKind.invoice } });
    const recipientLines = () =>
      title
        .findAll("section")[0]
        .findAll("p")
        .map((line) => line.text());
    expect(recipientLines()).toContain("Österreich");

    await title.setProps({ result: { ...invoice, client_country: "CH" } });
    expect(recipientLines()).toContain("CH");

    await title.setProps({ result: { ...invoice, client_country: "DE" } });
    expect(recipientLines()).not.toContain("DE");
    expect(recipientLines()).not.toContain("Österreich");
  });

  it("uses the invoice service date for item VAT as well as totals", () => {
    const table = mount(DocumentArticleTable, {
      props: {
        kind: DocumentKind.invoice,
        document: { ...invoice, client_reverse_vat: false, service_dates: ["2020-08-01"] },
      },
    });
    const cells = table.findAll(".item-table tbody tr")[0].findAll("td");
    expect(cells[5].text()).toBe("16 %");
    expect(cells[6].text()).toBe("16");
    expect(cells[7].text()).toBe("116");
    expect(table.findAll(".sum-table tbody tr")[1].text()).toContain("116,00");
  });

  it("updates editor amounts when the client tax setting changes", async () => {
    const wrapper = mount(SubOrderPositions, {
      props: {
        subOrderPositions: [
          { kind: ArticleKind.item, title: "Work", description: "", amount: 2, price: 50 },
        ],
        vatDate: new Date("2026-01-01"),
        hasAutomaticRentalNote: false,
        isReverseVat: true,
      },
      global: {
        stubs: {
          Button: true,
          Dialog: true,
          Divider: true,
          FloatLabel: true,
          InputNumber: true,
          InputText: true,
          Textarea: true,
        },
      },
    });
    expect(wrapper.text()).toContain("USt: -");
    expect(wrapper.text()).toContain("Brutto: -");
    await wrapper.setProps({ isReverseVat: false });
    expect(wrapper.text()).toContain("19,00");
    expect(wrapper.text()).toContain("119,00");
  });

  it("calculates reminder totals using each invoice's tax snapshot", () => {
    const document: OverdueNoticeDocument = {
      ...invoice,
      overdue_notice_id: 1,
      notice_level: OverdueNoticeLevel.first,
      notice_date: "2026-01-01",
      payments_until: "2026-01-01",
      notice_costs: 10,
      default_interest: 5,
      invoice_documents: [invoice, { ...invoice, id: "ordinary", client_reverse_vat: false }],
    };
    const wrapper = mount(DocumentInvoiceItemTable, { props: { document } });
    const rows = wrapper.findAll(".item-table tbody tr");
    expect(rows[0].findAll("td")[4].text()).toBe("-");
    expect(rows[0].findAll("td")[5].text()).toContain("100,00");
    expect(rows[1].findAll("td")[4].text()).toContain("19,00");
    expect(wrapper.findAll(".sum-table tbody tr")[1].text()).toContain("234,00");
  });

  it("uses the invoice snapshot when editing a reminder", () => {
    const order = { id: "order-1" } as Order;
    const notice: OverdueNotice = {
      id: 1,
      order_id: order.id,
      order,
      invoice_documents: [invoice, { ...invoice, id: "ordinary", client_reverse_vat: false }],
      description: "",
      notice_date: "2026-01-01",
      payments_until: "2026-01-01",
      payment_target: "2026-01-15",
      notice_level: OverdueNoticeLevel.first,
      payment_status: OverdueNoticePaymentStatus.initial,
      notice_costs: 10,
      default_interest: 5,
      created_at: 0,
      updated_at: 0,
    };
    const wrapper = shallowMount(OverdueNoticeEdit, {
      props: { order, existingOverdueNotice: notice },
    });
    expect(wrapper.text()).toContain("USt: 19,00");
    expect(wrapper.text()).toContain("Brutto: 234,00");
  });
});
