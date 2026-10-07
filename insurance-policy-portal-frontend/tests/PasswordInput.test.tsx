import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import PasswordInput from "@/components/PasswordInput";

describe("PasswordInput", () => {
  it("should render the password input with the provided label", () => {
    render(
      <PasswordInput
        label="Password"
        value=""
        onChange={vi.fn()}
      />
    );

    expect(
      screen.getByText("Password")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Enter password")
    ).toBeInTheDocument();
  });

  it("should render the input as a password field by default", () => {
    render(
      <PasswordInput
        label="Password"
        value="Password123!"
        onChange={vi.fn()}
      />
    );

    const input = screen.getByDisplayValue(
      "Password123!"
    );

    expect(input).toHaveAttribute(
      "type",
      "password"
    );
  });

  it("should show the password when Show password is checked", async () => {
    const user = userEvent.setup();

    render(
      <PasswordInput
        label="Password"
        value="Password123!"
        onChange={vi.fn()}
      />
    );

    const passwordInput = screen.getByDisplayValue(
      "Password123!"
    );

    const checkbox = screen.getByRole("checkbox", {
      name: "Show password",
    });

    expect(passwordInput).toHaveAttribute(
      "type",
      "password"
    );

    await user.click(checkbox);

    expect(passwordInput).toHaveAttribute(
      "type",
      "text"
    );
  });

  it("should hide the password again when Show password is unchecked", async () => {
    const user = userEvent.setup();

    render(
      <PasswordInput
        label="Password"
        value="Password123!"
        onChange={vi.fn()}
      />
    );

    const passwordInput = screen.getByDisplayValue(
      "Password123!"
    );

    const checkbox = screen.getByRole("checkbox", {
      name: "Show password",
    });

    await user.click(checkbox);

    expect(passwordInput).toHaveAttribute(
      "type",
      "text"
    );

    await user.click(checkbox);

    expect(passwordInput).toHaveAttribute(
      "type",
      "password"
    );
  });

  it("should call onChange when the user enters a password", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <PasswordInput
        label="Password"
        value=""
        onChange={onChange}
      />
    );

    const input = screen.getByPlaceholderText(
      "Enter password"
    );

    await user.type(input, "Password123!");

    expect(onChange).toHaveBeenCalled();
  });

  it("should display the required indicator when required is true", () => {
    render(
      <PasswordInput
        label="Password"
        value=""
        onChange={vi.fn()}
        required
      />
    );

    expect(
      screen.getByText("*")
    ).toBeInTheDocument();
  });

  it("should display the error message when validation is enabled", () => {
    render(
      <PasswordInput
        label="Password"
        value=""
        onChange={vi.fn()}
        error="Password must contain at least 8 characters"
        showValidationMessage
      />
    );

    expect(
      screen.getByText(
        "Password must contain at least 8 characters"
      )
    ).toBeInTheDocument();
  });

  it("should not display the error message when validation is disabled", () => {
    render(
      <PasswordInput
        label="Password"
        value=""
        onChange={vi.fn()}
        error="Password must contain at least 8 characters"
        showValidationMessage={false}
      />
    );

    expect(
      screen.queryByText(
        "Password must contain at least 8 characters"
      )
    ).not.toBeInTheDocument();
  });
});