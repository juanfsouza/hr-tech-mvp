export interface OrgChartNode {
    id: string;
    name: string;
    role: string;
    department?: string;
    email?: string;
    children: OrgChartNode[];
}
