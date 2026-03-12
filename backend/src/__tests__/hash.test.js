import { describe, it, expect } from "@jest/globals";
import { hashToken } from "../utils/hash.js";

describe("hashToken", () => {

  it("genera un hash string desde un token", () => {
    const token = "mi_token_de_prueba";
    const hash = hashToken(token);

    // ✅ Debe devolver un string
    expect(typeof hash).toBe("string");

    // ✅ El hash no debe ser igual al token original
    expect(hash).not.toBe(token);
  });

  it("genera el mismo hash para el mismo input", () => {
    const token = "token_consistente";

    // ✅ SHA-256 es determinístico — mismo input = mismo output
    expect(hashToken(token)).toBe(hashToken(token));
  });

  it("genera hashes diferentes para tokens diferentes", () => {
    expect(hashToken("token_A")).not.toBe(hashToken("token_B"));
  });

  it("el hash tiene 64 caracteres (SHA-256 en hex)", () => {
    const hash = hashToken("cualquier_token");
    expect(hash.length).toBe(64);
  });

});