import * as React from "react"
import { Label, Pie, PieChart } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"


const chartConfig = {
  wins: {
    label: "Wins",
    color: "hsl(var(--accent))",
  },
  losses: {
    label: "Losses",
    color: "hsl(var(--chart-2))",
  },
}

export function DonutChart({wins, losses}) {
  const chartData = [
    { type: "wins", value: wins, fill: "hsl(var(--accent))" },
    { type: "losses", value: losses, fill: "#F4433" },
  ]
  const totalGames = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0)
  }, [])

  const winRate = React.useMemo(() => {
    const wins = chartData.find((data) => data.type === "wins")?.value || 0
    return ((wins / totalGames) * 100).toFixed(2)
  }, [totalGames])

  return (
    <ChartContainer
    config={chartConfig}
    className="mx-auto aspect-square h-full"
  >
    <PieChart>
      <ChartTooltip
        cursor={false}
        content={<ChartTooltipContent hideLabel />}
      />
      <Pie
        data={chartData}
        dataKey="value"
        nameKey="type"
        innerRadius={60}
        outerRadius={80}
        strokeWidth={5}
      >
        <Label
          content={({ viewBox }) => {
            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
              return (
                <text
                  x={viewBox.cx}
                  y={viewBox.cy}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  <tspan
                    x={viewBox.cx}
                    y={viewBox.cy}
                    className="fill-foreground text-lg font-bold"
                  >
                    {winRate}%
                  </tspan>
                  <tspan
                    x={viewBox.cx}
                    y={(viewBox.cy || 0) + 24}
                    className="fill-muted-foreground"
                  >
                    Win Rate
                  </tspan>
                </text>
              )
            }
          }}
        />
      </Pie>
    </PieChart>
  </ChartContainer>
  )
}