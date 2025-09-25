import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: "pre_active" | "active" | "inactive" | string }) {
    switch (status) {
        case "active":
            return <Badge className="bg-emerald-600 hover:bg-emerald-600">Ativo</Badge>;
        case "pre_active":
            return <Badge className="bg-amber-500 hover:bg-amber-500">Pré-ativo</Badge>;
        case "inactive":
            return <Badge variant="secondary">Inativo</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}
