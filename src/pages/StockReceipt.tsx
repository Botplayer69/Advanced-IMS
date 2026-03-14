import React, { useState } from 'react';
import {
    ArrowDownLeft,
    Package,
    Warehouse,
    ClipboardList,
    AlertCircle,
    CheckCircle2,
    Clock,
    User
} from 'lucide-react';
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const mockRecentMovements = [
    { id: "WH/IN/04521", product: "Servo Motor A12", qty: 50, time: "12 min ago", user: "J. Carter" },
    { id: "WH/IN/04520", product: "PCB Board Rev.4", qty: 200, time: "5 hours ago", user: "M. Chen" },
    { id: "WH/IN/04518", product: "Thermal Paste TG-7", qty: 15, time: "Yesterday", user: "S. Park" },
];

export default function StockReceipt() {
    const [formData, setFormData] = useState({
        product: '',
        quantity: '',
        warehouse: '',
        supplier: '',
        reference: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleValidate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.product || !formData.quantity || !formData.warehouse) {
            toast.error("Required Fields Missing", {
                description: "Please select a product, quantity, and destination warehouse."
            });
            return;
        }

        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));

        console.log("Validating Movement:", formData);
        toast.success("Validation Successful", {
            description: `${formData.quantity} units of ${formData.product} received at ${formData.warehouse}.`
        });

        // Reset form partially for next entry
        setFormData(prev => ({
            ...prev,
            quantity: '',
            reference: ''
        }));
        setIsSubmitting(false);
    };

    return (
        <div className="flex flex-col h-full bg-background">
            <header className="h-14 border-b border-border flex items-center px-8 shrink-0 bg-card/50 backdrop-blur-md sticky top-0 z-20">
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Operations</span>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-foreground font-semibold">Stock Receipt</span>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8">
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center text-success border border-success/20 shadow-sm">
                                <ArrowDownLeft size={24} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-foreground">Stock Receipt</h1>
                                <p className="text-sm text-muted-foreground font-medium">Process incoming goods and update inventory levels</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className="bg-success/5 text-success border-success/20 px-3 py-1 text-xs">
                                <Clock size={12} className="mr-1.5" /> Live Processing
                            </Badge>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Form Card */}
                        <Card className="lg:col-span-2 border-border shadow-md bg-card/50">
                            <CardHeader className="border-b border-border/50 pb-4">
                                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <ClipboardList size={16} /> Receipt Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-8">
                                <form onSubmit={handleValidate} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Product */}
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                                <Package size={14} /> Product <span className="text-destructive">*</span>
                                            </label>
                                            <Select value={formData.product} onValueChange={(val) => handleSelectChange('product', val)}>
                                                <SelectTrigger className="h-11 bg-background">
                                                    <SelectValue placeholder="Select product..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Servo Motor A12">Servo Motor A12 (SRV-A12-C)</SelectItem>
                                                    <SelectItem value="PCB Board Rev.4">PCB Board Rev.4 (PCB-004-A)</SelectItem>
                                                    <SelectItem value="Hydraulic Pump HP-200">Hydraulic Pump HP-200 (HYD-200-A)</SelectItem>
                                                    <SelectItem value="Industrial Sensor Pro X">Industrial Sensor Pro X (SNS-992-B)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Quantity */}
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                                Quantity <span className="text-destructive">*</span>
                                            </label>
                                            <Input
                                                type="number"
                                                name="quantity"
                                                value={formData.quantity}
                                                onChange={handleInputChange}
                                                placeholder="Enter quantity"
                                                className="h-11 bg-background font-mono"
                                            />
                                        </div>

                                        {/* Warehouse */}
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                                <Warehouse size={14} /> Warehouse <span className="text-destructive">*</span>
                                            </label>
                                            <Select value={formData.warehouse} onValueChange={(val) => handleSelectChange('warehouse', val)}>
                                                <SelectTrigger className="h-11 bg-background">
                                                    <SelectValue placeholder="Select destination..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Main Warehouse (WH-A)">Main Warehouse (WH-A)</SelectItem>
                                                    <SelectItem value="North Annex (WH-B)">North Annex (WH-B)</SelectItem>
                                                    <SelectItem value="Receiving Dock">Receiving Dock</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Supplier */}
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                                Supplier / Vendor
                                            </label>
                                            <Input
                                                type="text"
                                                name="supplier"
                                                value={formData.supplier}
                                                onChange={handleInputChange}
                                                placeholder="e.g. Siemens Gmbh"
                                                className="h-11 bg-background"
                                            />
                                        </div>
                                    </div>

                                    {/* Reference */}
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                            Reference / Tracking Number
                                        </label>
                                        <Input
                                            type="text"
                                            name="reference"
                                            value={formData.reference}
                                            onChange={handleInputChange}
                                            placeholder="e.g. PO-8821-X"
                                            className="h-11 bg-background font-mono"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        size="lg"
                                        disabled={isSubmitting}
                                        className="w-full h-12 text-md font-bold transition-all shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90"
                                    >
                                        {isSubmitting ? "Processing..." : "Validate & Update Stock"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Sidebar Info */}
                        <div className="space-y-6">
                            <Card className="border-border bg-accent/20">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                                        <AlertCircle size={14} /> Processing Guide
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="text-xs text-muted-foreground space-y-3">
                                        <li className="flex gap-2">
                                            <CheckCircle2 size={12} className="text-success shrink-0 mt-0.5" />
                                            <span>Verify physical counts match the input quantity before validation.</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <CheckCircle2 size={12} className="text-success shrink-0 mt-0.5" />
                                            <span>Double-check destination warehouse to prevent misplacement.</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <CheckCircle2 size={12} className="text-success shrink-0 mt-0.5" />
                                            <span>Validation will immediately update global stock levels and log history.</span>
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <div className="space-y-4">
                                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">Recent Movements</h3>
                                <div className="space-y-3">
                                    {mockRecentMovements.map((move) => (
                                        <div key={move.id} className="p-3 bg-card border border-border rounded-lg flex items-center justify-between group hover:border-primary/50 transition-colors cursor-default">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-mono font-bold text-primary">{move.id}</span>
                                                    <span className="text-[10px] text-muted-foreground">• {move.time}</span>
                                                </div>
                                                <p className="text-[11px] font-semibold text-foreground">{move.product}</p>
                                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/70">
                                                    <User size={10} /> {move.user}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-mono font-bold text-success">+{move.qty}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button variant="ghost" className="w-full text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors h-8">
                                    VIEW ALL HISTORY
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Float Badge */}
            <div className="fixed bottom-6 right-6 z-50">
                <div className="bg-popover/80 border border-border backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-3 shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex -space-x-2">
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[8px] text-primary-foreground border-2 border-background">JS</div>
                        <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center text-[8px] text-success-foreground border-2 border-background">MC</div>
                    </div>
                    <span className="text-[10px] font-medium text-foreground">3 users active in operations</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                </div>
            </div>
        </div>
    );
}
