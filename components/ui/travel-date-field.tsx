"use client";

import * as React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

/** Inline / field date picker backed by `react-datepicker` (for forms that need an input + popper, not `react-day-picker`). */
export function TravelDateField(props: React.ComponentProps<typeof DatePicker>) {
  return <DatePicker {...props} />;
}
