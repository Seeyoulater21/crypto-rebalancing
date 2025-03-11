
import React, { useState } from "react";
import { format, addYears, subYears } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BacktestParams } from "@/utils/backtestUtils";
import { Bitcoin, Percent, DollarSign, CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BacktestFormProps {
  params: BacktestParams;
  onParamsChange: (params: BacktestParams) => void;
  isLoading: boolean;
  earliestDate: string;
  latestDate: string;
}

const BacktestForm = ({
  params,
  onParamsChange,
  isLoading,
  earliestDate,
  latestDate
}: BacktestFormProps) => {
  // Date picker state
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [startDateView, setStartDateView] = useState<Date | undefined>(
    params.startDate ? new Date(params.startDate) : undefined
  );
  const [endDateView, setEndDateView] = useState<Date | undefined>(
    params.endDate ? new Date(params.endDate) : undefined
  );
  
  // Predefined ranges for quick selection
  const dateRanges = [
    { label: "All Time", value: "all" },
    { label: "Last 5 Years", value: "5y" },
    { label: "Last 3 Years", value: "3y" },
    { label: "Last Year", value: "1y" },
    { label: "Last 6 Months", value: "6m" },
    { label: "Last 3 Months", value: "3m" },
    { label: "Last Month", value: "1m" },
  ];

  // Form state management
  const handleCapitalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      onParamsChange({ ...params, initialCapital: value });
    }
  };

  const handleRatioChange = (value: number[]) => {
    onParamsChange({ ...params, bitcoinRatio: value[0] });
  };

  const handleThresholdChange = (value: number[]) => {
    onParamsChange({ ...params, rebalanceThreshold: value[0] });
  };

  // Handle month and year selection
  const handleMonthYearSelect = (date: Date, isStartDate: boolean) => {
    // Set to first day of the month
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const formattedDate = firstDayOfMonth.toISOString().split('T')[0];
    
    if (isStartDate) {
      onParamsChange({ ...params, startDate: formattedDate });
      setStartDateOpen(false);
    } else {
      onParamsChange({ ...params, endDate: formattedDate });
      setEndDateOpen(false);
    }
  };

  // Handle predefined range selection
  const handleRangeChange = (value: string) => {
    const endDate = new Date();
    let startDate = new Date();
    
    switch (value) {
      case "all":
        startDate = new Date(earliestDate);
        break;
      case "5y":
        startDate = subYears(endDate, 5);
        break;
      case "3y":
        startDate = subYears(endDate, 3);
        break;
      case "1y":
        startDate = subYears(endDate, 1);
        break;
      case "6m":
        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 6, 1);
        break;
      case "3m":
        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 3, 1);
        break;
      case "1m":
        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1);
        break;
      default:
        startDate = new Date(earliestDate);
    }
    
    // Ensure start date isn't earlier than earliest available date
    if (startDate < new Date(earliestDate)) {
      startDate = new Date(earliestDate);
    }
    
    // Set to first day of month for both dates
    const firstDayOfStartMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const firstDayOfEndMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
    
    onParamsChange({
      ...params,
      startDate: firstDayOfStartMonth.toISOString().split('T')[0],
      endDate: firstDayOfEndMonth.toISOString().split('T')[0]
    });
    
    // Update date view states
    setStartDateView(firstDayOfStartMonth);
    setEndDateView(firstDayOfEndMonth);
  };
  
  // Navigation buttons for year
  const goPrevYear = (dateView: Date | undefined, setDateView: React.Dispatch<React.SetStateAction<Date | undefined>>) => {
    if (dateView) {
      setDateView(subYears(dateView, 1));
    }
  };
  
  const goNextYear = (dateView: Date | undefined, setDateView: React.Dispatch<React.SetStateAction<Date | undefined>>) => {
    if (dateView) {
      setDateView(addYears(dateView, 1));
    }
  };
  
  // Month picker renderer
  const renderMonthPicker = (
    currentDate: Date | undefined,
    onChange: (date: Date) => void
  ) => {
    if (!currentDate) return null;
    
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    return (
      <div className="p-3">
        <div className="flex justify-between items-center mb-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => goPrevYear(currentDate, currentDate === startDateView ? setStartDateView : setEndDateView)}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="font-medium">{currentYear}</div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => goNextYear(currentDate, currentDate === startDateView ? setStartDateView : setEndDateView)}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {months.map((month, idx) => {
            const date = new Date(currentYear, idx, 1);
            const isSelected = idx === currentMonth;
            
            return (
              <Button
                key={month}
                variant={isSelected ? "default" : "outline"}
                className={cn(
                  "h-9",
                  isSelected && "bg-bitcoin hover:bg-bitcoin/90 text-white"
                )}
                onClick={() => {
                  const newDate = new Date(currentYear, idx, 1);
                  onChange(newDate);
                }}
              >
                {month}
              </Button>
            );
          })}
        </div>
      </div>
    );
  };
  
  // Date display formatting - show only month and year
  const formatDateDisplay = (dateString: string | undefined) => {
    if (!dateString) return "Select date";
    return format(new Date(dateString), "MMM yyyy");
  };

  return (
    <Card className="rounded-xl overflow-hidden animate-scale-in smooth-shadow">
      <div className="bitcoin-gradient text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bitcoin className="h-5 w-5" />
          <h3 className="font-medium">Backtest Parameters</h3>
        </div>
      </div>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="capital" className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              Initial Capital
            </label>
            <span className="text-sm text-muted-foreground">${params.initialCapital.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Input
              id="capital"
              type="number"
              min="1000"
              value={params.initialCapital}
              onChange={handleCapitalChange}
              className="input-focus-ring"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center gap-2">
              <Bitcoin className="h-4 w-4 text-muted-foreground" />
              Bitcoin Allocation Ratio
            </label>
            <span className="text-sm text-muted-foreground">
              {params.bitcoinRatio}% BTC / {100 - params.bitcoinRatio}% USD
            </span>
          </div>
          <Slider
            value={[params.bitcoinRatio]}
            min={1}
            max={99}
            step={1}
            onValueChange={handleRatioChange}
            className="py-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1% BTC</span>
            <span>99% BTC</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center gap-2">
              <Percent className="h-4 w-4 text-muted-foreground" />
              Rebalance Threshold
            </label>
            <span className="text-sm text-muted-foreground">{params.rebalanceThreshold}%</span>
          </div>
          <Slider
            value={[params.rebalanceThreshold]}
            min={1}
            max={25}
            step={1}
            onValueChange={handleThresholdChange}
            className="py-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Frequent (1%)</span>
            <span>Infrequent (25%)</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Date Range</label>
          </div>
          
          <Select onValueChange={handleRangeChange} defaultValue="all">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              {dateRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Start Date</div>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "justify-start text-left font-normal w-full",
                      !params.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDateDisplay(params.startDate)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-50" align="start">
                  {renderMonthPicker(
                    startDateView, 
                    (date) => handleMonthYearSelect(date, true)
                  )}
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">End Date</div>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "justify-start text-left font-normal w-full",
                      !params.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDateDisplay(params.endDate)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-50" align="start">
                  {renderMonthPicker(
                    endDateView,
                    (date) => handleMonthYearSelect(date, false)
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground mt-2 text-center">
            {params.startDate && params.endDate ? (
              <span>
                Backtest period: {formatDateDisplay(params.startDate)} to {formatDateDisplay(params.endDate)}
              </span>
            ) : (
              <span>Select date range to run backtest</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BacktestForm;
