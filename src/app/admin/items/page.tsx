
'use client';

import { ItemLibrary } from "@/components/inventory/item-library";

export default function AdminItemsPage() {
    return (
        <div className="flex flex-col gap-8">
            <ItemLibrary />
        </div>
    );
}
