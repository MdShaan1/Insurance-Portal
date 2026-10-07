import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import LoginPage from "@/app/login/page";
import { login } from "@/src/lib/api";

vi.mock("@/src/lib/api", () => ({
  login: vi.fn(),
}));

const mockedLogin = vi.mocked(login);

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the login page", () => {
    render(<LoginPage />);

    expect(
      screen.getByRole("heading", {
        name: "Sign In",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Enter username")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Enter password")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Sign In",
      })
    ).toBeInTheDocument();
  });

  it("should display username validation error when username is empty", async () => {
    const user = userEvent.setup();

    render(<LoginPage />);

    await user.click(
      screen.getByRole("button", {
        name: "Sign In",
      })
    );

    expect(
      screen.getByText("Please enter Username.")
    ).toBeInTheDocument();

    expect(mockedLogin).not.toHaveBeenCalled();
  });

  it("should display password validation error when password is empty", async () => {
    const user = userEvent.setup();

    render(<LoginPage />);

    await user.type(
      screen.getByPlaceholderText("Enter username"),
      "testuser"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Sign In",
      })
    );

    expect(
      screen.getByText("Please enter Password.")
    ).toBeInTheDocument();

    expect(mockedLogin).not.toHaveBeenCalled();
  });

  it("should not call login when both fields are empty", async () => {
    const user = userEvent.setup();

    render(<LoginPage />);

    await user.click(
      screen.getByRole("button", {
        name: "Sign In",
      })
    );

    expect(mockedLogin).not.toHaveBeenCalled();
  });

  it("should call login with the entered credentials", async () => {
    const user = userEvent.setup();

    mockedLogin.mockResolvedValue({
      id: 1,
      username: "testuser",
    });

    render(<LoginPage />);

    await user.type(
      screen.getByPlaceholderText("Enter username"),
      "testuser"
    );

    await user.type(
      screen.getByPlaceholderText("Enter password"),
      "Password123!"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Sign In",
      })
    );

    expect(mockedLogin).toHaveBeenCalledTimes(1);

    expect(mockedLogin).toHaveBeenCalledWith({
      username: "testuser",
      password: "Password123!",
    });
  });

  it("should trim whitespace from username before calling login", async () => {
    const user = userEvent.setup();

    mockedLogin.mockImplementation(
      () => new Promise(() => {})
    );

    render(<LoginPage />);

    await user.type(
      screen.getByPlaceholderText("Enter username"),
      "   testuser   "
    );

    await user.type(
      screen.getByPlaceholderText("Enter password"),
      "Password123!"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Sign In",
      })
    );

    expect(mockedLogin).toHaveBeenCalledWith({
      username: "testuser",
      password: "Password123!",
    });
  });

  it("should display the loading state while login is in progress", async () => {
    const user = userEvent.setup();

    mockedLogin.mockImplementation(
      () => new Promise(() => {})
    );

    render(<LoginPage />);

    await user.type(
      screen.getByPlaceholderText("Enter username"),
      "testuser"
    );

    await user.type(
      screen.getByPlaceholderText("Enter password"),
      "Password123!"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Sign In",
      })
    );

    expect(
      screen.getByRole("button", {
        name: "Signing In...",
      })
    ).toBeDisabled();
  });

  it("should display the API error when login fails", async () => {
    const user = userEvent.setup();

    mockedLogin.mockRejectedValue(
      new Error("Invalid username or password.")
    );

    render(<LoginPage />);

    await user.type(
      screen.getByPlaceholderText("Enter username"),
      "wronguser"
    );

    await user.type(
      screen.getByPlaceholderText("Enter password"),
      "WrongPassword123!"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Sign In",
      })
    );

    expect(
      await screen.findByText(
        "Invalid username or password."
      )
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Sign In",
      })
    ).toBeInTheDocument();
  });

  it("should render the Create an account link", () => {
    render(<LoginPage />);

    const registerLink = screen.getByRole("link", {
      name: "Create an account",
    });

    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute(
      "href",
      "/register"
    );
  });
});