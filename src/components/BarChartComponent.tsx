"use client"

import PropTypes from "prop-types"
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// Helper function to create a config from data
const generateChartConfig = (data, xKey, yKey) => {
  const config = {
    [xKey]: { label: xKey.charAt(0).toUpperCase() + xKey.slice(1) },
    [yKey]: { label: yKey.charAt(0).toUpperCase() + yKey.slice(1) },
  }
  data.forEach((item, index) => {
    config[item[yKey]] = {
      label: item[yKey],
      color: item.color || `hsl(${(index * 60) % 360}, 70%, 50%)`,
    }
  })
  return config
}

export function BarChartComponent({
  data,
  xKey,
  yKey,
  title,
  description,
}: {
  data: Array<{ [key: string]: string | number } & { color?: string }>;
  xKey: string;
  yKey: string;
  title?: string;
  description?: string;
}) {
  const chartConfig = generateChartConfig(data, xKey, yKey)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={data}
            layout="vertical"
            margin={{
              left: 0,
            }}
          >
            <YAxis
              dataKey={yKey}
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <XAxis dataKey={xKey} type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey={xKey}
              layout="vertical"
              radius={5}
              fill="var(--default-color)"
              shape={(props: { payload: { color?: string } } & any) => {
                const { payload, tooltipPosition, tooltipPayload, dataKey, ...rest } = props;
                return (
                  <rect
                    {...rest}
                    fill={payload.color || "var(--default-color)"}
                  />
                );
              }}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total values for the selected period
        </div>
      </CardFooter>
    </Card>
  )
}

// Specify the expected prop types
BarChartComponent.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      color: PropTypes.string, // Optional color field
    })
  ).isRequired,
  xKey: PropTypes.string.isRequired,
  yKey: PropTypes.string.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
}

BarChartComponent.defaultProps = {
  title: "Bar Chart",
  description: "Chart Description",
}

export default BarChartComponent
