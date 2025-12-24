/**
 * @file client/src/shared/ui/composites/animated-donut-chart.tsx
 * @description Animated donut chart component with label rendering
 */

import * as React from "react";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Sector,
    Tooltip,
    Legend as RechartsLegend
} from "recharts";

interface ChartDataItem {
    name: string;
    value?: number;
    count?: number;
    fill?: string;
    color?: string;
    [key: string]: string | number | undefined;
}

interface AnimatedDonutChartProps {
    data: ChartDataItem[];
    dataKey?: string;
    innerRadius?: number;
    outerRadius?: number;
    expandedRadius?: number;
    paddingAngle?: number;
    showTooltip?: boolean;
    centerLabel?: string;
    centerValue?: string | number;
    showLegend?: boolean;
    height?: number | string;
    className?: string;
}

// Custom active shape that expands on hover
const renderActiveShape = (props: any) => {
    const {
        cx,
        cy,
        innerRadius,
        outerRadius,
        startAngle,
        endAngle,
        fill,
        payload,
        percent,
        value,
    } = props;

    // Expanded radius when hovered
    const expandedOuterRadius = outerRadius + 10;

    return (
        <g>
            {/* Expanded sector */}
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={expandedOuterRadius}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
                style={{
                    filter: "drop-shadow(0px 4px 12px rgba(0, 0, 0, 0.15))",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
            />
            {/* Center background for better contrast */}
            <circle
                cx={cx}
                cy={cy}
                r={innerRadius - 4}
                fill="hsl(var(--card))"
                opacity={0.95}
            />
            {/* Center label - using currentColor for theme awareness */}
            <text
                x={cx}
                y={cy}
                dy={-10}
                textAnchor="middle"
                className="fill-muted-foreground font-medium uppercase tracking-wider"
                style={{ fontSize: 10, letterSpacing: '0.05em' }}
            >
                {payload.name}
            </text>
            <text
                x={cx}
                y={cy}
                dy={14}
                textAnchor="middle"
                className="fill-foreground font-bold tracking-tight"
                style={{ fontSize: 24 }}
            >
                {value}
            </text>
        </g>
    );
};

export function AnimatedDonutChart({
    data,
    dataKey = "value",
    innerRadius = 60,
    outerRadius = 100,
    paddingAngle = 3,
    showTooltip = true,
    centerLabel,
    centerValue,
    showLegend = false,
    height = "100%",
    className,
}: AnimatedDonutChartProps) {
    const [activeIndex, setActiveIndex] = React.useState<number | undefined>(undefined);

    const onPieEnter = React.useCallback((_: any, index: number) => {
        setActiveIndex(index);
    }, []);

    const onPieLeave = React.useCallback(() => {
        setActiveIndex(undefined);
    }, []);

    // Get fill color from data item
    const getFillColor = (item: ChartDataItem) => {
        return item.fill || item.color || "hsl(var(--primary))";
    };

    // Calculate total for center if needed
    const displayValue = React.useMemo(() => {
        if (centerValue !== undefined) return centerValue;
        return data.reduce((sum, item) => sum + (typeof item[dataKey] === 'number' ? item[dataKey] : 0), 0);
    }, [data, dataKey, centerValue]);

    return (
        <ResponsiveContainer width="100%" height={height}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={innerRadius}
                    outerRadius={outerRadius}
                    paddingAngle={paddingAngle}
                    dataKey={dataKey}
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    onMouseEnter={onPieEnter}
                    onMouseLeave={onPieLeave}
                    animationDuration={400}
                    animationEasing="ease-out"
                    style={{ outline: "none", cursor: "pointer" }}
                    stroke="none"
                >
                    {data.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={getFillColor(entry)}
                            strokeWidth={0}
                            style={{
                                outline: "none",
                                transition: "all 0.3s ease-out",
                            }}
                        />
                    ))}
                </Pie>

                {/* Default Center Text (when not hovering) */}
                {activeIndex === undefined && centerLabel && (
                    <g>
                        <text
                            x="50%"
                            y="50%"
                            dy={-10}
                            textAnchor="middle"
                            className="fill-muted-foreground font-medium uppercase tracking-wider"
                            style={{ fontSize: 10, letterSpacing: '0.05em' }}
                        >
                            {centerLabel}
                        </text>
                        <text
                            x="50%"
                            y="50%"
                            dy={14}
                            textAnchor="middle"
                            className="fill-foreground font-bold tracking-tight"
                            style={{ fontSize: 24 }}
                        >
                            {displayValue}
                        </text>
                    </g>
                )}

                {showTooltip && (
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            color: "hsl(var(--foreground))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: "8px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            border: "1px solid hsl(var(--border))",
                            padding: "8px 12px",
                        }}
                        itemStyle={{
                            color: "hsl(var(--foreground))",
                            fontSize: "12px",
                            fontWeight: 500,
                            padding: 0
                        }}
                        wrapperStyle={{ outline: "none" }}
                        formatter={(value: number, name: string) => [
                            <span key="val" className="text-foreground font-semibold">{value}</span>,
                            <span key="name" className="text-muted-foreground ml-1">{name}</span>
                        ]}
                    />
                )}

                {showLegend && (
                    <RechartsLegend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
                        formatter={(value, entry: any) => (
                            <span className="text-foreground font-medium ml-1 mr-3">{value}</span>
                        )}
                    />
                )}
            </PieChart>
        </ResponsiveContainer>
    );
}

