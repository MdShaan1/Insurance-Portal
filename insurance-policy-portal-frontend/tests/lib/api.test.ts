import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  login,
  signUp,
  verifyPolicyholder,
  type RegistrationRequest,
  type UserLoginRequest,
  type PolicyholderVerificationRequest,
} from "@/src/lib/api";

describe("API functions", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================================
  // VERIFY POLICYHOLDER
  // ============================================================

  describe("verifyPolicyholder", () => {
    const policyholderData: PolicyholderVerificationRequest = {
      ssn: "1234",
      policyNumber: "POL123456",
      firstName: "John",
      lastName: "Doe",
      dateOfBirth: "1990-01-15",
      zipCode: "12345",
    };

    it("should successfully verify a policyholder", async () => {
      const mockResponse = {
        verified: true,
        message: "Policyholder verified successfully",
      };

      const fetchMock = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue({
          ok: true,
          json: vi.fn().mockResolvedValue(mockResponse),
        } as unknown as Response);

      const result = await verifyPolicyholder(policyholderData);

      expect(fetchMock).toHaveBeenCalledTimes(1);

      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:5034/api/User/verify-policyholder",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "*/*",
          },
          body: JSON.stringify(policyholderData),
        }
      );

      expect(result).toEqual(mockResponse);
    });

    it("should throw an error when policyholder verification fails", async () => {
      const fetchMock = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue({
          ok: false,
          json: vi.fn().mockResolvedValue({
            message: "Policyholder not found",
          }),
        } as unknown as Response);

      await expect(
        verifyPolicyholder(policyholderData)
      ).rejects.toThrow("Policyholder not found");

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================
  // SIGN UP
  // ============================================================

  describe("signUp", () => {
    const registrationData: RegistrationRequest = {
      personalInformation: {
        ssn: "1234",
        policyNumber: "POL123456",
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: "1990-01-15",
        zipCode: "12345",
      },

      accountInformation: {
        username: "johndoe",
        password: "Password123!",
        confirmPassword: "Password123!",
      },

      securityInformation: {
        petName: "Buddy",
        childhoodFriendName: "Michael",
      },

      contactInformation: {
        email: "john@example.com",
        phone: "9876543210",
        streetAddress: "123 Main Street",
        streetAddressLine2: "",
        city: "New York",
        state: "NY",
        zipCode: "12345",
        country: "USA",
      },
    };

    it("should successfully register a user", async () => {
      const mockResponse = {
        id: 1,
        username: "johndoe",
        message: "Registration successful",
      };

      const fetchMock = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue({
          ok: true,
          json: vi.fn().mockResolvedValue(mockResponse),
        } as unknown as Response);

      const result = await signUp(registrationData);

      expect(fetchMock).toHaveBeenCalledTimes(1);

      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:5034/api/User/SignUp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "*/*",
          },
          body: JSON.stringify(registrationData),
        }
      );

      expect(result).toEqual(mockResponse);
    });

    it("should throw an error when registration fails", async () => {
      const fetchMock = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue({
          ok: false,
          json: vi.fn().mockResolvedValue({
            message: "Username already exists",
          }),
        } as unknown as Response);

      await expect(
        signUp(registrationData)
      ).rejects.toThrow("Username already exists");

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================
  // LOGIN
  // ============================================================

  describe("login", () => {
    const loginData: UserLoginRequest = {
      username: "johndoe",
      password: "Password123!",
    };

    it("should successfully login a user", async () => {
      const mockResponse = {
        id: 1,
        username: "johndoe",
        message: "Login successful",
      };

      const fetchMock = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue({
          ok: true,
          json: vi.fn().mockResolvedValue(mockResponse),
        } as unknown as Response);

      const result = await login(loginData);

      expect(fetchMock).toHaveBeenCalledTimes(1);

      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:5034/api/User/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "*/*",
          },
          body: JSON.stringify(loginData),
        }
      );

      expect(result).toEqual(mockResponse);
    });

    it("should throw an error when login fails", async () => {
      const fetchMock = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue({
          ok: false,
          json: vi.fn().mockResolvedValue({
            message: "Invalid username or password",
          }),
        } as unknown as Response);

      await expect(login(loginData)).rejects.toThrow(
        "Invalid username or password"
      );

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });
});