import { createTestingPinia } from "@pinia/testing";
import { flushPromises, shallowMount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { useRoute } from "vue-router";

import { getClientMock, getOrderMock } from "@/__tests__/helpers/mocks";
import { getClient, getOrder } from "@/backendClient";
import InvoiceEdit from "@/components/orders/InvoiceEdit.vue";
import { PaymentStatus } from "@/global/types/appTypes";
import type { Invoice } from "@/global/types/entities";
import OrderView from "@/views/OrderView.vue";

vi.mock("vue-router");
vi.mock("@/backendClient");
vi.mock("@/composables/useNotifications", () => ({
  default: () => ({ showNotification: vi.fn() }),
}));
vi.mock("@/composables/useConfirmations", () => ({
  default: () => ({ showConfirmation: vi.fn() }),
}));

describe("order reverse charge", () => {
  it.each([1, 5])("propagates the selected client setting with %s invoice tabs", async (count) => {
    const order = getOrderMock();
    const invoices: Invoice[] = Array.from({ length: count }, (_, index) => ({
      id: index + 1,
      order_id: order.id,
      order,
      status: PaymentStatus.initial,
      service_dates: ["2026-01-01"],
      invoice_date: "2026-01-01",
      payment_target: "2026-01-15",
      description: "",
      items: [],
      created_at: 0,
      updated_at: 0,
    }));
    vi.mocked(useRoute).mockReturnValue({
      params: { id: order.id },
      query: {},
      matched: [],
      name: undefined,
      fullPath: "/orders/1/edit",
      hash: "",
      path: "/orders/1/edit",
      redirectedFrom: undefined,
      meta: {},
    });
    vi.mocked(getOrder).mockResolvedValue({ ...order, invoices });
    vi.mocked(getClient).mockResolvedValue({ ...getClientMock(), reverse_vat: true });

    const wrapper = shallowMount(OrderView, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
        stubs: {
          Card: { template: "<div><slot name='content' /></div>" },
          Tabs: { template: "<div><slot /></div>" },
          TabPanels: { template: "<div><slot /></div>" },
          TabPanel: { template: "<div><slot /></div>" },
        },
      },
    });
    await flushPromises();
    expect(wrapper.find("tag-stub").attributes("value")).toBe("Reverse Charge (ohne MwSt.)");
    expect(wrapper.findComponent(InvoiceEdit).props("isReverseVat")).toBe(true);

    wrapper.findComponent({ name: "AutoComplete" }).vm.$emit("update:modelValue", {
      ...getClientMock(),
      reverse_vat: false,
    });
    await flushPromises();
    expect(wrapper.find("tag-stub").exists()).toBe(false);
    expect(wrapper.findComponent(InvoiceEdit).props("isReverseVat")).toBe(false);
  });
});
