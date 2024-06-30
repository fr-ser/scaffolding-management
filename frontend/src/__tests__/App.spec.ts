import { shallowMount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

import App from "@/App.vue";
import NavigationBar from "@/components/NavigationBar.vue";

vi.mock("vue-router");

describe("App", () => {
  it("renders properly", () => {
    const wrapper = shallowMount(App, {
      global: {
        stubs: ["router-view"],
      },
    });

    expect(wrapper.findComponent(NavigationBar).exists()).toBe(true);
  });
});
