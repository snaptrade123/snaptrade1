import { useMemo } from 'react';
import { TradingRecommendation } from '@/lib/api';

interface TradingLevelsChartProps {
  tradingRecommendation: TradingRecommendation;
  direction: 'bullish' | 'bearish' | 'neutral';
}

const TradingLevelsChart: React.FC<TradingLevelsChartProps> = ({
  tradingRecommendation,
  direction
}) => {
  const { entryPrice, stopLoss, takeProfit } = tradingRecommendation;
  
  // Return null if any of the required values are missing
  if (entryPrice === null || entryPrice === undefined ||
      stopLoss === null || stopLoss === undefined ||
      takeProfit === null || takeProfit === undefined) {
    return null;
  }
  
  // Determine order of prices based on direction
  const prices = useMemo(() => {
    const allPrices = [
      { type: 'entry', value: entryPrice, label: 'Entry' },
      { type: 'sl', value: stopLoss, label: 'Stop Loss' },
      { type: 'tp', value: takeProfit, label: 'Take Profit' }
    ].filter(p => p.value !== null && p.value !== undefined);
    
    return allPrices.sort((a, b) => {
      if (direction === 'bullish') {
        // For bullish, we want highest at top
        return b.value! - a.value!;
      } else {
        // For bearish, we want lowest at top
        return a.value! - b.value!;
      }
    });
  }, [entryPrice, stopLoss, takeProfit, direction]);
  
  // Find min and max for scale
  const minValue = Math.min(...prices.map(p => p.value!));
  const maxValue = Math.max(...prices.map(p => p.value!));
  const range = maxValue - minValue;
  
  // Add 10% padding to top and bottom
  const paddedMin = minValue - range * 0.1;
  const paddedMax = maxValue + range * 0.1;
  const paddedRange = paddedMax - paddedMin;
  
  return (
    <div className="border border-border rounded-md p-4 mb-4 relative z-10 bg-background">
      <h4 className="text-sm font-medium mb-3">Price Levels Visualization</h4>
      <div className="relative h-[200px] w-full">
        {prices.map((price, index) => {
          // Calculate position as percentage from bottom with additional spacing
          // This ensures price labels don't overlap by adding vertical offsets
          const basePosition = ((price.value! - paddedMin) / paddedRange) * 100;
          
          // Add vertical offsets to ensure labels don't overlap, especially if values are close
          const verticalOffset = index * 2; // 2% spacing between labels if prices are very close
          const position = Math.min(basePosition + verticalOffset, 95); // Cap at 95% to keep in container
          
          return (
            <div 
              key={price.type} 
              className={`absolute w-full left-0 trading-level z-20`}
              style={{ bottom: `${position}%` }}
            >
              <div className={`relative bg-background border border-border rounded-sm px-2 py-1 w-full flex justify-between items-center shadow-sm ${
                price.type === 'tp' ? 'text-emerald-500 border-emerald-500/30' : 
                price.type === 'sl' ? 'text-red-500 border-red-500/30' : 
                'text-primary border-primary/30'
              }`}>
                <span className="text-xs font-medium">{price.label}</span>
                <span className="text-sm font-bold">
                  {price.value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
                </span>
              </div>
              
              {/* Add a dotted line to show actual price level */}
              <div 
                className={`absolute w-full h-px border-t border-dotted ${
                  price.type === 'tp' ? 'border-emerald-500/50' : 
                  price.type === 'sl' ? 'border-red-500/50' : 
                  'border-primary/50'
                }`}
                style={{ bottom: `${basePosition - position}%` }}
              />
            </div>
          );
        })}
        
        {/* Direction indicator */}
        <div className="absolute right-3 inset-y-0 flex items-center z-10">
          <div className={`h-[75%] w-1 rounded-full ${
            direction === 'bullish' ? 'bg-gradient-to-t from-primary to-emerald-500' :
            direction === 'bearish' ? 'bg-gradient-to-b from-primary to-red-500' :
            'bg-gradient-to-t from-amber-500 to-amber-500'
          }`}></div>
        </div>
      </div>
      
      {/* Risk-Reward calculation */}
      {tradingRecommendation.riskRewardRatio && (
        <div className="text-center text-xs text-muted-foreground mt-2">
          <span>Risk:Reward → 1:{tradingRecommendation.riskRewardRatio.toFixed(1)}</span>
        </div>
      )}
    </div>
  );
};

export default TradingLevelsChart;