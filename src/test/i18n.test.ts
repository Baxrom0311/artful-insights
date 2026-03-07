import { describe, expect, it } from "vitest";
import i18n from "@/lib/i18n";

describe("i18n interpolation", () => {
  it("renders numeric placeholders in navbar credits", async () => {
    await i18n.changeLanguage("uz");
    expect(i18n.t("nav:credits", { count: 7 })).toBe("7 kredit");

    await i18n.changeLanguage("en");
    expect(i18n.t("nav:credits", { count: 7 })).toBe("7 credits");

    await i18n.changeLanguage("ru");
    expect(i18n.t("nav:credits", { count: 7 })).toBe("7 кредитов");
  });

  it("renders other placeholders in history and score labels", async () => {
    await i18n.changeLanguage("uz");
    expect(i18n.t("history:page", { page: 3 })).toBe("3-sahifa");
    expect(i18n.t("score:grade", { grade: "A" })).toBe("Baho: A");
  });
});
