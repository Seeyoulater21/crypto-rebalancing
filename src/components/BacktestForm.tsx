
import React, { useEffect } from "react";
import { format } from "date-fns";
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
import { BacktestParams } from "@/utils/backtestUtils";
import { Bitcoin, Percent, DollarSign, RotateCw, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface BacktestFormProps {
  params: BacktestParams;
  onParamsChange: (params: BacktestParams) => void;
  onRunBacktest: () => void;
  isLoading: boolean;
  earliestDate: string;
  latestDate: string;
}

const BacktestForm = ({
  params,
  onParamsChange,
  onRunBacktest,
  isLoading,
  earliestDate,
  latestDate
}: BacktestFormProps) => {
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
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      const formattedDate = date.toISOString().split('T')[0];
      onParamsChange({ ...params, endDate: formattedDate });
    }
  };

  useEffect(() => {
    // Run initial backtest on mount
    onRunBacktest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            <label className="text-sm font-medium flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              Date Range
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Start Date</div>
              <Popover>
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
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={params.startDate ? new Date(params.startDate) : undefined}
                    onSelect={handleStartDateChange}
                    disabled={(date) => {
                      return (
                        date > new Date(params.endDate) ||
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
              <Popover>
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
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={params.endDate ? new Date(params.endDate) : undefined}
                    onSelect={handleEndDateChange}
                    disabled={(date) => {
                      return (
                        date < new Date(params.startDate) ||
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
        </div>

        <Button 
          onClick={onRunBacktest} 
          disabled={isLoading}
          className="w-full bg-bitcoin hover:bg-bitcoin-dark text-white gap-2"
        >
          {isLoading ? (
            <>
              <RotateCw className="h-4 w-4 animate-spin" />
              Running Backtest...
            </>
          ) : (
            <>
              <RotateCw className="h-4 w-4" />
              Run Backtest
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default BacktestForm;
