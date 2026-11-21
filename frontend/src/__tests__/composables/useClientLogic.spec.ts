import { describe, expect, it, vi } from "vitest";

import { useClientValidation } from "@/composables/useClientLogic";
import { useOrderValidation } from "@/composables/useOrderLogic";
import { trimStringsAndReplaceEmptyWithNull } from "@/helpers/utils";

vi.mock("@/composables/useNotifications", () => ({
  default: () => ({
    showNotification: vi.fn(),
  }),
}));

describe("useClientLogic", () => {
  const { validateAndCleanPayload } = useClientValidation();

  it("sets default country to DE if empty or omitted", () => {
    const cleaned = validateAndCleanPayload({
      first_name: "Max",
      country: "",
    });
    expect(cleaned.country).toBe("DE");
  });

  it("preserves non-DE country", () => {
    const cleaned = validateAndCleanPayload({
      first_name: "Max",
      country: "AT",
    });
    expect(cleaned.country).toBe("AT");
  });

  it("casts reverse_vat to boolean", () => {
    const cleanedTrue = validateAndCleanPayload({
      first_name: "Max",
      reverse_vat: true,
    });
    expect(cleanedTrue.reverse_vat).toBe(true);

    const cleanedFalse = validateAndCleanPayload({
      first_name: "Max",
      reverse_vat: false,
    });
    expect(cleanedFalse.reverse_vat).toBe(false);
  });

  it("trims vat_id and sends null when it is cleared", () => {
    const cleanedWithVat = validateAndCleanPayload({
      first_name: "Max",
      vat_id: "  ATU12345  ",
    });
    expect(cleanedWithVat.vat_id).toBe("ATU12345");

    const cleanedEmptyVat = validateAndCleanPayload({
      first_name: "Max",
      vat_id: "   ",
    });
    expect(cleanedEmptyVat.vat_id).toBeNull();
  });

  it("does not add an omitted VAT ID to an update", () => {
    const cleaned = validateAndCleanPayload({ first_name: "Max" });
    expect(cleaned).not.toHaveProperty("vat_id");
  });

  it("trims client fields before validation", () => {
    const cleaned = validateAndCleanPayload({
      first_name: "  Max  ",
      company_name: "  ",
      country: " AT ",
    });
    expect(cleaned.first_name).toBe("Max");
    expect(cleaned.company_name).toBeNull();
    expect(cleaned.country).toBe("AT");
    expect(() => validateAndCleanPayload({ first_name: "   " })).toThrow();
  });

  it("also trims fields in other form payloads", () => {
    const cleaned = useOrderValidation().validateAndCleanPayload({
      title: "  Project  ",
      client_id: " client-1 ",
      description: "  first line\n  second line  ",
    });
    expect(cleaned.title).toBe("Project");
    expect(cleaned.client_id).toBe("client-1");
    expect(cleaned.description).toBe("first line\n  second line");
  });

  it("preserves non-string properties and leaves the input unchanged", () => {
    const input = { name: "  Example  ", count: 0, enabled: false, value: null, items: ["  x  "] };
    const cleaned = trimStringsAndReplaceEmptyWithNull(input);
    expect(cleaned).toEqual({
      name: "Example",
      count: 0,
      enabled: false,
      value: null,
      items: ["  x  "],
    });
    expect(input.name).toBe("  Example  ");
  });
});
