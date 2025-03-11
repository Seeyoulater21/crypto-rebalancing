
import React, { useState } from "react";
import { format, addYears, subYears, addMonths, subMonths } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { Bitcoin, Percent, DollarSign, CalendarIcon } from "lucide-react";
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

  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      const formattedDate = date.toISOString().split('T')[0];
      onParamsChange({ ...params, startDate: formattedDate });
      setStartDateOpen(false);
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      const formattedDate = date.toISOString().split('T')[0];
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
        startDate = subMonths(endDate, 6);
        break;
      case "3m":
        startDate = subMonths(endDate, 3);
        break;
      case "1m":
        startDate = subMonths(endDate, 1);
        break;
      default:
        startDate = new Date(earliestDate);
    }
    
    // Ensure start date isn't earlier than earliest available date
    if (startDate < new Date(earliestDate)) {
      startDate = new Date(earliestDate);
    }
    
    onParamsChange({
      ...params,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });
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
                    {params.startDate ? format(new Date(params.startDate), "MMM dd, yyyy") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={params.startDate ? new Date(params.startDate) : undefined}
                    onSelect={handleStartDateChange}
                    disabled={(date) => {
                      return (
                        date > new Date(params.endDate || latestDate) ||
                        date < new Date(earliestDate) ||
                        date > new Date(latestDate)
                      );
                    }}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
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
                    {params.endDate ? format(new Date(params.endDate), "MMM dd, yyyy") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={params.endDate ? new Date(params.endDate) : undefined}
                    onSelect={handleEndDateChange}
                    disabled={(date) => {
                      return (
                        date < new Date(params.startDate || earliestDate) ||
                        date > new Date(latestDate) ||
                        date < new Date(earliestDate)
                      );
                    }}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground mt-2 text-center">
            {params.startDate && params.endDate ? (
              <span>
                Backtest period: {format(new Date(params.startDate), "MMM dd, yyyy")} to {format(new Date(params.endDate), "MMM dd, yyyy")}
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
