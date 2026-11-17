import { flushPromises, mount } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import { afterEach, describe, expect, it, vi } from "vitest";

import { sendDocumentAsEmail } from "@/backendClient";
import DocumentEmail from "@/components/documents/DocumentEmail.vue";
import { DocumentKind } from "@/global/types/appTypes";
import type { InvoiceDocument } from "@/global/types/entities";

vi.mock("@/backendClient", () => ({ sendDocumentAsEmail: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@/composables/useConfirmations", () => ({
  default: () => ({ showConfirmation: vi.fn().mockResolvedValue(true) }),
}));
vi.mock("@/composables/useNotifications", () => ({
  default: () => ({ showNotification: vi.fn() }),
}));

const document: InvoiceDocument = {
  id: "invoice-1",
  created_at: 0,
  updated_at: 0,
  creation_date: "2026-11-17",
  client_id: "client-1",
  client_email: "client@example.com",
  order_id: "order-1",
  order_title: "Test project",
  invoice_id: 1,
  items: [],
  invoice_date: "2026-11-17",
  service_dates: [],
  payment_target: "2026-12-01",
  can_have_cash_discount: false,
  discount_duration: 0,
  discount_percentage: 0,
};

const notice = `🎄 Wichtiger Hinweis zum Gerüstabbau zum Jahresende 🎄

Bitte beachten Sie: Gerüste, die nach dem 07.12.2026 abgemeldet werden, können in diesem Jahr leider nicht mehr abgebaut werden. Der Abbau erfolgt in diesem Fall erst im neuen Jahr.

Wir bitten um entsprechende Berücksichtigung und wünschen Ihnen eine schöne und besinnliche Adventszeit sowie frohe Weihnachten! ✨🎅

❄️ Vielen Dank für Ihr Verständnis! ❄️`;

function mountEmail(kind: DocumentKind, time: string) {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(time));
  return mount(DocumentEmail, {
    props: { kind, document },
    global: {
      plugins: [PrimeVue],
      stubs: {
        Dialog: { template: "<div><slot /></div>" },
        FileUpload: true,
        Textarea: {
          props: ["modelValue"],
          emits: ["update:modelValue"],
          template: `<textarea :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" />`,
        },
      },
    },
  });
}

afterEach(() => {
  vi.useRealTimers();
});

describe("DocumentEmail", () => {
  it.each([
    ["2026-11-16T22:59:59.999Z", false],
    ["2026-11-16T23:00:00.000Z", true],
    ["2026-12-19T22:59:59.999Z", true],
    ["2026-12-19T23:00:00.000Z", false],
    ["2027-12-01T12:00:00.000Z", false],
  ])("includes the notice at %s: %s", (time, included) => {
    const wrapper = mountEmail(DocumentKind.invoice, time);
    const message = wrapper.get("textarea").element.value;

    expect(message.includes(notice)).toBe(included);
    if (included) {
      expect(message).toContain(
        `Mit freundlichen Grüßen\n\n${notice}\n\n${import.meta.env.VITE_COMPANY_NAME}`,
      );
    } else {
      expect(message).toContain(`Mit freundlichen Grüßen\n\n${import.meta.env.VITE_COMPANY_NAME}`);
    }
  });

  it.each([DocumentKind.offer, DocumentKind.overdueNotice, DocumentKind.creditNote])(
    "does not add the notice to %s emails",
    (kind) => {
      const wrapper = mountEmail(kind, "2026-12-01T12:00:00.000Z");
      expect(wrapper.get("textarea").element.value).not.toContain(notice);
    },
  );

  it("sends the edited message rather than forcing the notice", async () => {
    const wrapper = mountEmail(DocumentKind.invoice, "2026-12-01T12:00:00.000Z");
    await wrapper.get("textarea").setValue("Edited message");
    const sendButton = wrapper.findAll("button").find((button) => button.text() === "Senden");
    if (!sendButton) throw new Error("Send button not found");
    await sendButton.trigger("click");
    await flushPromises();

    expect(sendDocumentAsEmail).toHaveBeenCalledWith(
      expect.objectContaining({ kind: DocumentKind.invoice, message: "Edited message" }),
      [],
    );
  });
});
