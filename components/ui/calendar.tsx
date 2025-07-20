"use client"

import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Input } from "@/components/ui/input";

export type CalendarProps = {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  placeholderText?: string;
  dateFormat?: string;
  className?: string;
};

export function Calendar(props: React.ComponentProps<typeof DatePicker>) {
  return <DatePicker {...props} />;
}
