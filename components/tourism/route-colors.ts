
const ROUTE_COLORS = ["#f59e0b", "#ef4444", "#38bdf8", "#a855f7", "#f472b6", "#22d3ee", "#facc15", "#fb923c"];

export const routeColor = (index: number) => ROUTE_COLORS[index % ROUTE_COLORS.length];
