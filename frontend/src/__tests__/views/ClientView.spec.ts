import { createTestingPinia } from "@pinia/testing";
import { flushPromises, shallowMount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { useRoute } from "vue-router";

import { getClientMock, getOrderMock } from "@/__tests__/helpers/mocks";
import { getClient, getOrders } from "@/backendClient";
import ClientView from "@/views/ClientView.vue";

vi.mock("vue-router");
vi.mock("@/backendClient");

describe("ClientView", () => {
  vi.mocked(useRoute).mockReturnValue({ params: { id: "1" } } as any);
  vi.mocked(getClient).mockResolvedValue(getClientMock());
  vi.mocked(getOrders).mockResolvedValue({ data: [getOrderMock()], totalCount: 1 });

  describe("get orders of client", () => {
    it("renders the button and opens the modal", async () => {
      // given
      const wrapper = shallowMount(ClientView, {
        global: {
          stubs: ["router-link"],
          plugins: [createTestingPinia({ createSpy: vi.fn })],
        },
      });
      expect(wrapper.findAll('[data-testid="client-order"]')).toHaveLength(0);

      // when
      wrapper.get('[data-testid="show-orders-button"]').trigger("click");
      await flushPromises();

      // then
      expect(wrapper.findAll('[data-testid="client-order"]')).toHaveLength(1);
      expect(wrapper.find('[data-testid="show-more-button"]').exists()).toBe(false);
    });

    it("deals with pagination", async () => {
      // given
      vi.mocked(getOrders).mockResolvedValue({ data: [getOrderMock()], totalCount: 2 });

      const wrapper = shallowMount(ClientView, {
        global: {
          stubs: ["router-link"],
          plugins: [createTestingPinia({ createSpy: vi.fn })],
        },
      });

      // when
      wrapper.get('[data-testid="show-orders-button"]').trigger("click");
      await flushPromises();

      // then
      wrapper.get('[data-testid="show-more-button"]');
      const initialPaginationCount = vi.mocked(getOrders).mock.calls[0][0]?.take as number;

      // given #2
      vi.mocked(getOrders).mockResolvedValue({
        data: [getOrderMock(), getOrderMock()],
        totalCount: 2,
      });

      // when #2
      wrapper.get('[data-testid="show-more-button"]').trigger("click");
      await flushPromises();

      // then #2
      expect(wrapper.findAll('[data-testid="client-order"]')).toHaveLength(2);
      expect(vi.mocked(getOrders).mock.calls[1][0]?.take).toBeGreaterThan(initialPaginationCount);
    });
  });
});
