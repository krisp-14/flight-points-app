"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/shared/utils";

import "react-day-picker/style.css";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

/**
 * Month grid for popovers and inline picking (react-day-picker).
 * For a text-field + popper date entry, use {@link TravelDateField} with react-datepicker instead.
 */
export function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 [--rdp-accent-color:#ea580c]", className)}
      classNames={classNames}
      {...props}
    />
  );
}
