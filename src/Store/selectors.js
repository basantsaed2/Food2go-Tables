import { createSelector } from "@reduxjs/toolkit";

export const selectSignUpType = createSelector(
  (state) => state.signUpType?.data,
  (data) => {
    return { ...data }; // Ensure transformation logic
  }
);

export const selectOtpCode = createSelector(
  (state) => state.otp?.code,
  (code) => {
    return code ? String(code) : null; // Ensure transformation logic
  }
);

export const selectNewPassState = createSelector(
  (state) => state.newPass,
  (newPass) => {
    return Boolean(newPass); // Ensure transformation logic
  }
);
