import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import CreateDocumentButton from "@/components/orders/CreateDocumentButton.vue";
import { DocumentKind } from "@/global/types/appTypes";

function mountComponent(props: { id: number; kind: DocumentKind; hasExistingDocument?: boolean }) {
  return mount(CreateDocumentButton, {
    props,
    global: {
      stubs: ["router-link"],
      directives: {
        tooltip(element, binding: { value?: string }) {
          if (binding.value) element.setAttribute("data-tooltip", binding.value);
        },
      },
    },
  });
}

describe("CreateDocumentButton", () => {
  it("disables invoice document creation when a document already exists", () => {
    const wrapper = mountComponent({
      id: 1,
      kind: DocumentKind.invoice,
      hasExistingDocument: true,
    });

    const button = wrapper.get('[data-testid="create-document-button"]');
    const tooltipWrapper = wrapper.get('[data-testid="create-document-tooltip-wrapper"]');

    expect(button.attributes("disabled")).toBeDefined();
    expect(button.text()).toBe("Dokument Erstellen");
    expect(tooltipWrapper.attributes("data-tooltip")).toBe(
      "Für diese Rechnung existiert bereits ein Dokument.",
    );
  });

  it("disables overdue notice document creation when a document already exists", () => {
    const wrapper = mountComponent({
      id: 1,
      kind: DocumentKind.overdueNotice,
      hasExistingDocument: true,
    });

    const button = wrapper.get('[data-testid="create-document-button"]');
    const tooltipWrapper = wrapper.get('[data-testid="create-document-tooltip-wrapper"]');

    expect(button.attributes("disabled")).toBeDefined();
    expect(button.text()).toBe("Dokument Erstellen");
    expect(tooltipWrapper.attributes("data-tooltip")).toBe(
      "Für diese Mahnung existiert bereits ein Dokument.",
    );
  });

  it("keeps offer document creation enabled", () => {
    const wrapper = mountComponent({
      id: 1,
      kind: DocumentKind.offer,
      hasExistingDocument: true,
    });

    const button = wrapper.get('[data-testid="create-document-button"]');
    const tooltipWrapper = wrapper.get('[data-testid="create-document-tooltip-wrapper"]');

    expect(button.attributes("disabled")).toBeUndefined();
    expect(button.text()).toBe("Dokument Erstellen");
    expect(tooltipWrapper.attributes("data-tooltip")).toBeUndefined();
  });
});
