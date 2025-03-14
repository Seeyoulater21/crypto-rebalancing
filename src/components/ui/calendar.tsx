
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, useNavigation } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium hidden", // Hide the default label
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
        Caption: ({ displayMonth, ...props }) => {
          const { goToMonth, nextMonth, previousMonth, currentMonth } = useNavigation();
          
          // Generate month options
          const months = Array.from({ length: 12 }, (_, i) => {
            const month = new Date();
            month.setMonth(i);
            return {
              value: i.toString(),
              label: month.toLocaleString('default', { month: 'short' })
            };
          });
          
          // Generate year options (5 years back and 5 years forward)
          const currentYear = displayMonth.getFullYear();
          const minYear = currentYear - 5;
          const maxYear = currentYear + 5;
          const years = Array.from(
            { length: maxYear - minYear + 1 },
            (_, i) => {
              const year = minYear + i;
              return {
                value: year.toString(),
                label: year.toString()
              };
            }
          );
          
          return (
            <div className="flex justify-center items-center gap-1 py-1">
              <Select
                value={displayMonth.getMonth().toString()}
                onValueChange={(value) => {
                  const newMonth = new Date(displayMonth);
                  newMonth.setMonth(parseInt(value));
                  goToMonth(newMonth);
                }}
              >
                <SelectTrigger className="h-7 w-[80px] text-xs font-normal bg-transparent border-none shadow-none focus:ring-0">
                  <SelectValue>
                    {displayMonth.toLocaleString('default', { month: 'short' })}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <div className="grid grid-cols-3 gap-1 p-1">
                    {months.map((month) => (
                      <SelectItem
                        key={month.value}
                        value={month.value}
                        className="py-1 px-2 rounded-sm text-center flex justify-center"
                      >
                        {month.label}
                      </SelectItem>
                    ))}
                  </div>
                </SelectContent>
              </Select>
              
              <Select
                value={displayMonth.getFullYear().toString()}
                onValueChange={(value) => {
                  const newMonth = new Date(displayMonth);
                  newMonth.setFullYear(parseInt(value));
                  goToMonth(newMonth);
                }}
              >
                <SelectTrigger className="h-7 w-[60px] text-xs font-normal bg-transparent border-none shadow-none focus:ring-0">
                  <SelectValue>
                    {displayMonth.getFullYear()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem
                      key={year.value}
                      value={year.value}
                      className="py-1"
                    >
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
