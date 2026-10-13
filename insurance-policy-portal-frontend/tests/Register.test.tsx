import { beforeEach, describe, expect, it, vi } from "vitest";
import { render as renderUi, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";

import RegisterPage from "@/app/register/page";
import { ApiClientProvider } from "@/src/lib/ApiClientProvider";
import {
  getSecurityQuestionLabels,
  verifyPolicyholder,
  signUp,
} from "@/src/lib/api";

vi.mock("@/src/lib/api", () => {
  const getSecurityQuestionLabels = vi.fn();
  const verifyPolicyholder = vi.fn();
  const signUp = vi.fn();
  const login = vi.fn();

  return {
    apiClient: {
      getSecurityQuestionLabels,
      verifyPolicyholder,
      signUp,
      login,
    },
    getSecurityQuestionLabels,
    verifyPolicyholder,
    signUp,
  };
});

const mockedGetSecurityQuestionLabels = vi.mocked(getSecurityQuestionLabels);
const mockedVerifyPolicyholder = vi.mocked(verifyPolicyholder);
const mockedSignUp = vi.mocked(signUp);
const render = (ui: ReactElement) =>
  renderUi(
    <ApiClientProvider>
      {ui}
    </ApiClientProvider>,
  );

beforeEach(() => {
  vi.clearAllMocks();
  mockedGetSecurityQuestionLabels.mockResolvedValue({
    petName: "What is your pet name?",
    childhoodFriendName: "What is your childhood friend's name?",
  });
});

describe("RegisterPage - Step 1", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the registration page", () => {
    render(<RegisterPage />);

    expect(
      screen.getByRole("heading", {
        name: "Create Your Account",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Personal Information",
      })
    ).toBeInTheDocument();

    expect(screen.getByText("Personal")).toBeInTheDocument();
    expect(screen.getByText("Account")).toBeInTheDocument();
    expect(screen.getByText("Security")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
  });

  it("should render all Step 1 personal information fields", () => {
    render(<RegisterPage />);

    expect(
      screen.getByPlaceholderText("Enter 4 digits")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Enter policy number")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Enter first name")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Enter last name")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("MM/DD/YYYY")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Enter ZIP code")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Verify & Continue",
      })
    ).toBeInTheDocument();
  });

  it("should display validation errors when Step 1 is submitted empty", async () => {
    const user = userEvent.setup();

    render(<RegisterPage />);

    await user.click(
      screen.getByRole("button", {
        name: "Verify & Continue",
      })
    );

    expect(
      screen.getByText(
        "Please enter the last 4 digits of SSN."
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText("Please enter Policy Number.")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Please enter First Name.")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Please enter Last Name.")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Please enter Date of Birth.")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Please enter ZIP Code.")
    ).toBeInTheDocument();

    expect(mockedVerifyPolicyholder).not.toHaveBeenCalled();
  });

  it("should reject an SSN that does not contain exactly 4 digits", async () => {
    const user = userEvent.setup();

    render(<RegisterPage />);

    const ssnInput =
      screen.getByPlaceholderText("Enter 4 digits");

    await user.type(ssnInput, "123");

    await user.click(
      screen.getByRole("button", {
        name: "Verify & Continue",
      })
    );

    expect(
      screen.getByText(
        "SSN must contain exactly 4 digits."
      )
    ).toBeInTheDocument();

    expect(
      mockedVerifyPolicyholder
    ).not.toHaveBeenCalled();
  });

  it("should reject a policy number that does not match the accepted format", async () => {
    const user = userEvent.setup();

    render(<RegisterPage />);

    await user.type(screen.getByPlaceholderText("Enter 4 digits"), "1234");
    await user.type(screen.getByPlaceholderText("Enter policy number"), "invalid");
    await user.type(screen.getByPlaceholderText("Enter first name"), "John");
    await user.type(screen.getByPlaceholderText("Enter last name"), "Doe");
    await user.type(screen.getByPlaceholderText("MM/DD/YYYY"), "01/15/1990");
    await user.type(screen.getByPlaceholderText("Enter ZIP code"), "12345");
    await user.click(screen.getByRole("button", { name: "Verify & Continue" }));

    expect(
      screen.getByText("Policy number must start with VA and contain 9-12 characters."),
    ).toBeInTheDocument();
    expect(mockedVerifyPolicyholder).not.toHaveBeenCalled();
  });

  it("should remove non-numeric characters from the SSN input", async () => {
    const user = userEvent.setup();

    render(<RegisterPage />);

    const ssnInput =
      screen.getByPlaceholderText("Enter 4 digits");

    await user.type(ssnInput, "12ab34");

    expect(ssnInput).toHaveValue("1234");
  });

  it("should call verifyPolicyholder with the entered personal information", async () => {
    const user = userEvent.setup();

    mockedVerifyPolicyholder.mockResolvedValue({
      verified: true,
      message: "Policyholder verified successfully",
    });

    render(<RegisterPage />);

    await user.type(
      screen.getByPlaceholderText("Enter 4 digits"),
      "1234"
    );

    await user.type(
      screen.getByPlaceholderText("Enter policy number"),
      "VA6666667"
    );

    await user.type(
      screen.getByPlaceholderText("Enter first name"),
      "John"
    );

    await user.type(
      screen.getByPlaceholderText("Enter last name"),
      "Doe"
    );

    await user.type(
      screen.getByPlaceholderText("MM/DD/YYYY"),
      "01/15/1990"
    );

    await user.type(
      screen.getByPlaceholderText("Enter ZIP code"),
      "12345"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Verify & Continue",
      })
    );

    expect(
      mockedVerifyPolicyholder
    ).toHaveBeenCalledTimes(1);

    expect(
      mockedVerifyPolicyholder
    ).toHaveBeenCalledWith({
      ssn: "1234",
      policyNumber: "VA6666667",
      firstName: "John",
      lastName: "Doe",
      dateOfBirth: "01/15/1990",
      zipCode: "12345",
    });
  });

  it("should move to Step 2 after successful policyholder verification", async () => {
    const user = userEvent.setup();

    mockedVerifyPolicyholder.mockResolvedValue({
      verified: true,
      message: "Policyholder verified successfully",
    });

    render(<RegisterPage />);

    await user.type(
      screen.getByPlaceholderText("Enter 4 digits"),
      "1234"
    );

    await user.type(
      screen.getByPlaceholderText("Enter policy number"),
      "VA6666667"
    );

    await user.type(
      screen.getByPlaceholderText("Enter first name"),
      "John"
    );

    await user.type(
      screen.getByPlaceholderText("Enter last name"),
      "Doe"
    );

    await user.type(
      screen.getByPlaceholderText("MM/DD/YYYY"),
      "01/15/1990"
    );

    await user.type(
      screen.getByPlaceholderText("Enter ZIP code"),
      "12345"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Verify & Continue",
      })
    );

    expect(
      await screen.findByRole("heading", {
        name: "Account Information",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Enter username")
    ).toBeInTheDocument();
  });

  it("should display an API error when policyholder verification fails", async () => {
    const user = userEvent.setup();

    mockedVerifyPolicyholder.mockRejectedValue(
      new Error("Policyholder details do not match")
    );

    render(<RegisterPage />);

    await user.type(
      screen.getByPlaceholderText("Enter 4 digits"),
      "1234"
    );

    await user.type(
      screen.getByPlaceholderText("Enter policy number"),
      "VA6666667"
    );

    await user.type(
      screen.getByPlaceholderText("Enter first name"),
      "John"
    );

    await user.type(
      screen.getByPlaceholderText("Enter last name"),
      "Doe"
    );

    await user.type(
      screen.getByPlaceholderText("MM/DD/YYYY"),
      "01/15/1990"
    );

    await user.type(
      screen.getByPlaceholderText("Enter ZIP code"),
      "12345"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Verify & Continue",
      })
    );

    expect(
      await screen.findByText(
        "Policyholder details do not match"
      )
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Personal Information",
      })
    ).toBeInTheDocument();
  });

  it("should display the Verifying state while verification is in progress", async () => {
    const user = userEvent.setup();

    mockedVerifyPolicyholder.mockImplementation(
      () => new Promise(() => {})
    );

    render(<RegisterPage />);

    await user.type(
      screen.getByPlaceholderText("Enter 4 digits"),
      "1234"
    );

    await user.type(
      screen.getByPlaceholderText("Enter policy number"),
      "VA6666667"
    );

    await user.type(
      screen.getByPlaceholderText("Enter first name"),
      "John"
    );

    await user.type(
      screen.getByPlaceholderText("Enter last name"),
      "Doe"
    );

    await user.type(
      screen.getByPlaceholderText("MM/DD/YYYY"),
      "01/15/1990"
    );

    await user.type(
      screen.getByPlaceholderText("Enter ZIP code"),
      "12345"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Verify & Continue",
      })
    );

    expect(
      screen.getByRole("button", {
        name: "Verifying...",
      })
    ).toBeDisabled();
  });
});

describe("RegisterPage - Step 2", () => {
  const goToStep2 = async (
    user: ReturnType<typeof userEvent.setup>
  ) => {
    mockedVerifyPolicyholder.mockResolvedValueOnce({
      verified: true,
      message: "Policyholder verified",
    });

    await user.type(
      screen.getByPlaceholderText("Enter 4 digits"),
      "1234"
    );

    await user.type(
      screen.getByPlaceholderText("Enter policy number"),
      "VA6666667"
    );

    await user.type(
      screen.getByPlaceholderText("Enter first name"),
      "John"
    );

    await user.type(
      screen.getByPlaceholderText("Enter last name"),
      "Doe"
    );

    await user.type(
      screen.getByPlaceholderText("MM/DD/YYYY"),
      "01/15/1995"
    );

    await user.type(
      screen.getByPlaceholderText("Enter ZIP code"),
      "12345"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Verify & Continue",
      })
    );

    await screen.findByRole("heading", {
      name: "Account Information",
    });
  };

  it("should display all Step 2 account fields", async () => {
    const user = userEvent.setup();

    render(<RegisterPage />);

    await goToStep2(user);

    expect(
      screen.getByPlaceholderText("Enter username")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Enter password")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Re-enter password")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Password requirements:")
    ).toBeInTheDocument();

    expect(
      screen.getByText("At least 8 characters")
    ).toBeInTheDocument();

    expect(
      screen.getByText("At least one uppercase letter")
    ).toBeInTheDocument();

    expect(
      screen.getByText("At least one lowercase letter")
    ).toBeInTheDocument();

    expect(
      screen.getByText("At least one special character")
    ).toBeInTheDocument();
  });

  it("should validate empty username", async () => {
    const user = userEvent.setup();

    render(<RegisterPage />);

    await goToStep2(user);

    await user.click(
      screen.getByRole("button", {
        name: "Continue",
      })
    );

    expect(
      screen.getByText("Please enter Username.")
    ).toBeInTheDocument();

    // Use queryByText for negative assertions.
    expect(
      screen.queryByText("Security Information")
    ).not.toBeInTheDocument();
  });

  it("should reject an invalid password", async () => {
    const user = userEvent.setup();

    render(<RegisterPage />);

    await goToStep2(user);

    await user.type(
      screen.getByPlaceholderText("Enter username"),
      "john123"
    );

    await user.type(
      screen.getByPlaceholderText("Enter password"),
      "password"
    );

    await user.type(
      screen.getByPlaceholderText("Re-enter password"),
      "password"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Continue",
      })
    );

    expect(
      screen.getByText("At least one uppercase letter")
    ).toBeInTheDocument();

    expect(
      screen.getByText("At least one special character")
    ).toBeInTheDocument();

    // Use queryByText for negative assertions.
    expect(
      screen.queryByText("Security Information")
    ).not.toBeInTheDocument();
  });

  it("should reject a password shorter than 8 characters", async () => {
    const user = userEvent.setup();

    render(<RegisterPage />);

    await goToStep2(user);

    await user.type(
      screen.getByPlaceholderText("Enter username"),
      "john123"
    );

    await user.type(
      screen.getByPlaceholderText("Enter password"),
      "Ab1!"
    );

    await user.type(
      screen.getByPlaceholderText("Re-enter password"),
      "Ab1!"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Continue",
      })
    );

    expect(
      screen.getByText("At least 8 characters")
    ).toBeInTheDocument();

    // Use queryByText for negative assertions.
    expect(
      screen.queryByText("Security Information")
    ).not.toBeInTheDocument();
  });

  it("should reject mismatched passwords", async () => {
    const user = userEvent.setup();

    render(<RegisterPage />);

    await goToStep2(user);

    await user.type(
      screen.getByPlaceholderText("Enter username"),
      "john123"
    );

    await user.type(
      screen.getByPlaceholderText("Enter password"),
      "Password@123"
    );

    await user.type(
      screen.getByPlaceholderText("Re-enter password"),
      "Different@123"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Continue",
      })
    );

    expect(
      screen.getByText("Passwords do not match.")
    ).toBeInTheDocument();

    // Use queryByText for negative assertions.
    expect(
      screen.queryByText("Security Information")
    ).not.toBeInTheDocument();
  });

  it("should show password match message when passwords are identical", async () => {
    const user = userEvent.setup();

    render(<RegisterPage />);

    await goToStep2(user);

    await user.type(
      screen.getByPlaceholderText("Enter password"),
      "Password@123"
    );

    const confirmPassword = screen.getByPlaceholderText(
      "Re-enter password"
    );

    await user.type(
      confirmPassword,
      "Password@123"
    );

    // Trigger the onBlur handler for confirm password.
    await user.click(
      screen.getByRole("heading", {
        name: "Account Information",
      })
    );

    // The actual rendered text contains the check mark.
    expect(
      screen.getByText("✓ Passwords match.")
    ).toBeInTheDocument();
  });

  it("should move to Step 3 with valid account information", async () => {
    const user = userEvent.setup();

    render(<RegisterPage />);

    await goToStep2(user);

    await user.type(
      screen.getByPlaceholderText("Enter username"),
      "john123"
    );

    await user.type(
      screen.getByPlaceholderText("Enter password"),
      "Password@123"
    );

    await user.type(
      screen.getByPlaceholderText("Re-enter password"),
      "Password@123"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Continue",
      })
    );

    expect(
      await screen.findByRole("heading", {
        name: "Security Information",
      })
    ).toBeInTheDocument();
  });

  it("should return to Step 1 when Back is clicked", async () => {
    const user = userEvent.setup();

    render(<RegisterPage />);

    await goToStep2(user);

    await user.click(
      screen.getByRole("button", {
        name: "Back",
      })
    );

    expect(screen.getByRole("heading", { name: "Personal Information" })).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Enter policy number")
    ).toBeInTheDocument();
  });
});

describe("Registration flow - Steps 3 and 4", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedVerifyPolicyholder.mockResolvedValue({
      verified: true,
      message: "Policyholder verified",
    });
  });

  async function completePersonalStep(user: ReturnType<typeof userEvent.setup>) {
    await user.type(screen.getByPlaceholderText("Enter 4 digits"), "1234");
    await user.type(screen.getByPlaceholderText("Enter policy number"), "VA6666667");
    await user.type(screen.getByPlaceholderText("Enter first name"), "John");
    await user.type(screen.getByPlaceholderText("Enter last name"), "Doe");
    await user.type(screen.getByPlaceholderText("MM/DD/YYYY"), "01/15/1990");
    await user.type(screen.getByPlaceholderText("Enter ZIP code"), "12345");
    await user.click(screen.getByRole("button", { name: "Verify & Continue" }));
    await screen.findByRole("heading", { name: "Account Information" });
  }

  async function completeAccountStep(user: ReturnType<typeof userEvent.setup>) {
    await user.type(screen.getByPlaceholderText("Enter username"), "john123");
    await user.type(screen.getByPlaceholderText("Enter password"), "Password@123");
    await user.type(screen.getByPlaceholderText("Re-enter password"), "Password@123");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await screen.findByRole("heading", { name: "Security Information" });
  }

  it("validates Step 3 and advances to Step 4", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);
    await completePersonalStep(user);
    await completeAccountStep(user);

    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByText("Please enter your pet name (2-100 characters).")).toBeInTheDocument();
    expect(screen.getByText("Please enter your childhood friend's name (2-100 characters).")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Contact Information" })).not.toBeInTheDocument();

    await user.type(screen.getByPlaceholderText("Enter your pet name"), "Buddy");
    await user.type(screen.getByPlaceholderText("Enter your childhood friend's name"), "Michael");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(await screen.findByRole("heading", { name: "Contact Information" })).toBeInTheDocument();
  }, 15_000);

  it("validates Step 4 before submitting registration", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);
    await completePersonalStep(user);
    await completeAccountStep(user);

    await user.type(screen.getByPlaceholderText("Enter your pet name"), "Buddy");
    await user.type(screen.getByPlaceholderText("Enter your childhood friend's name"), "Michael");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await screen.findByRole("heading", { name: "Contact Information" });

    await user.click(screen.getByRole("button", { name: "Create Account" }));

    expect(screen.getByText("Please enter Email.")).toBeInTheDocument();
    expect(screen.getByText("Please enter Phone Number.")).toBeInTheDocument();
    expect(screen.getByText("Please enter Street Address.")).toBeInTheDocument();
    expect(screen.getByText("Please enter City.")).toBeInTheDocument();
    expect(screen.getByText("Please enter State / Province.")).toBeInTheDocument();
    expect(screen.getByText("Please enter ZIP Code.")).toBeInTheDocument();
    expect(screen.getByText("Please enter Country.")).toBeInTheDocument();
    expect(mockedSignUp).not.toHaveBeenCalled();
  }, 20_000);

  it("renders security prompts supplied by server configuration", async () => {
    const user = userEvent.setup();
    mockedGetSecurityQuestionLabels.mockResolvedValue({
      petName: "Configured pet question",
      childhoodFriendName: "Configured friend question",
    });

    render(<RegisterPage />);
    await completePersonalStep(user);
    await completeAccountStep(user);

    expect(await screen.findByText("Configured pet question")).toBeInTheDocument();
    expect(screen.getByText("Configured friend question")).toBeInTheDocument();
  }, 15_000);

  it("submits all four steps and shows a server field error beside the affected field", async () => {
    const user = userEvent.setup();
    mockedSignUp
      .mockRejectedValueOnce(Object.assign(new Error("Email already exists."), {
        status: 409,
        fieldErrors: { "contactInformation.email": ["Email already exists."] },
      }))
      .mockResolvedValueOnce({ id: "user-id" });

    render(<RegisterPage />);
    await completePersonalStep(user);
    await completeAccountStep(user);
    await user.type(screen.getByPlaceholderText("Enter your pet name"), "Buddy");
    await user.type(screen.getByPlaceholderText("Enter your childhood friend's name"), "Michael");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await screen.findByRole("heading", { name: "Contact Information" });

    await user.type(screen.getByPlaceholderText("Enter email address"), "john@example.com");
    await user.type(screen.getByPlaceholderText("Enter phone number"), "9876543210");
    await user.type(screen.getByPlaceholderText("Enter street address"), "123 Main Street");
    await user.type(screen.getByPlaceholderText("Enter city"), "New York");
    await user.type(screen.getByPlaceholderText("Enter state or province"), "New York");
    await user.type(screen.getByPlaceholderText("Enter ZIP code"), "12345");
    await user.type(screen.getByPlaceholderText("Enter country"), "United States");
    await user.click(screen.getByRole("button", { name: "Create Account" }));

    expect(await screen.findAllByText("Email already exists.")).toHaveLength(2);
    expect(screen.getByLabelText("Email *")).toHaveAttribute("aria-invalid", "true");
    await user.clear(screen.getByPlaceholderText("Enter email address"));
    await user.type(screen.getByPlaceholderText("Enter email address"), "john.new@example.com");
    await user.click(screen.getByRole("button", { name: "Create Account" }));

    expect(await screen.findByRole("heading", { name: "Registration Successful" })).toBeInTheDocument();
    expect(mockedSignUp).toHaveBeenCalledTimes(2);
    expect(mockedSignUp).toHaveBeenLastCalledWith(expect.objectContaining({
      personalInformation: expect.objectContaining({ policyNumber: "VA6666667" }),
      accountInformation: expect.objectContaining({ username: "john123" }),
      securityInformation: expect.objectContaining({ petName: "Buddy" }),
      contactInformation: expect.objectContaining({ email: "john.new@example.com" }),
    }));
  }, 20_000);
});
