"use client";

import { useState } from "react";
import { useGym } from "@/contexts/gym-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FileText,
  Plus,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
} from "lucide-react";

// Local interface retained only if needed for TS hints; actual types from provider
interface WaiverBasic {
  id: string;
  memberName: string;
  memberEmail: string;
  waiverType: string;
  status: string;
  signedDate?: string;
  expiryDate: string;
  guardianName?: string;
  guardianSignature?: boolean;
  notes: string;
}

export function WaiverManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { waivers, addWaiver, archiveWaiver, removeWaiver, demoMode, limits } =
    useGym();

  const handleSendWaiver = async (formData: FormData) => {
    const res = await addWaiver({
      memberName: formData.get("memberName") as string,
      memberEmail: formData.get("memberEmail") as string,
      waiverType: formData.get("waiverType") as string,
      expiryDate: formData.get("expiryDate") as string,
      guardianName: (formData.get("guardianName") as string) || undefined,
      notes: (formData.get("notes") as string) || "",
    });
    if (!res.success) return alert(res.error);
    setIsAddDialogOpen(false);
  };

  const filteredWaivers = waivers.filter(
    (waiver) =>
      waiver.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      waiver.memberEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      waiver.waiverType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "signed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "signed":
        return <CheckCircle className="h-3 w-3" />;
      case "pending":
        return <Clock className="h-3 w-3" />;
      case "expired":
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Waiver Management</h2>
          <p className="text-muted-foreground">
            Manage liability waivers and legal documents
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={demoMode && waivers.length >= limits.waivers}>
              <Plus className="h-4 w-4 mr-2" />
              {demoMode && waivers.length >= limits.waivers
                ? "Demo Limit"
                : "Send Waiver"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Send New Waiver</DialogTitle>
              <DialogDescription>
                Send a waiver to a member for digital signature.
              </DialogDescription>
            </DialogHeader>
            <form action={handleSendWaiver} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="memberName">Member Name</Label>
                  <Input id="memberName" name="memberName" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="memberEmail">Member Email</Label>
                  <Input
                    id="memberEmail"
                    name="memberEmail"
                    type="email"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="waiverType">Waiver Type</Label>
                  <Select name="waiverType" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select waiver type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General Liability">
                        General Liability
                      </SelectItem>
                      <SelectItem value="Youth Liability">
                        Youth Liability (Under 18)
                      </SelectItem>
                      <SelectItem value="Competition Waiver">
                        Competition Waiver
                      </SelectItem>
                      <SelectItem value="Photo/Video Release">
                        Photo/Video Release
                      </SelectItem>
                      <SelectItem value="Medical Information">
                        Medical Information
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    name="expiryDate"
                    type="date"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="guardianName">Guardian Name (if minor)</Label>
                <Input
                  id="guardianName"
                  name="guardianName"
                  placeholder="Required for members under 18"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Any special instructions or notes..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Send Waiver</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Stats */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search waivers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex space-x-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-green-600">
              {waivers.filter((w: any) => w.status === "signed").length}
            </div>
            <div className="text-muted-foreground">Signed</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-yellow-600">
              {waivers.filter((w: any) => w.status === "pending").length}
            </div>
            <div className="text-muted-foreground">Pending</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-red-600">
              {waivers.filter((w: any) => w.status === "expired").length}
            </div>
            <div className="text-muted-foreground">Expired</div>
          </div>
        </div>
      </div>

      {/* Waivers List */}
      <div className="grid gap-4">
        {filteredWaivers.map((waiver: any) => (
          <Card key={waiver.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-lg">
                      {waiver.memberName}
                    </h3>
                    <Badge variant="outline">{waiver.waiverType}</Badge>
                    <Badge className={getStatusColor(waiver.status)}>
                      {getStatusIcon(waiver.status)}
                      <span className="ml-1 capitalize">{waiver.status}</span>
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {waiver.memberEmail}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Signed Date</p>
                      <p className="text-muted-foreground">
                        {waiver.signedDate
                          ? new Date(waiver.signedDate).toLocaleDateString()
                          : "Not signed"}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Expiry Date</p>
                      <p className="text-muted-foreground">
                        {new Date(waiver.expiryDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Guardian</p>
                      <p className="text-muted-foreground">
                        {waiver.guardianName || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Guardian Signed</p>
                      <p className="text-muted-foreground">
                        {waiver.guardianSignature ? "Yes" : "N/A"}
                      </p>
                    </div>
                  </div>
                  {waiver.notes && (
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <p className="text-sm">{waiver.notes}</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col space-y-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  {waiver.status === "pending" && (
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Resend
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => archiveWaiver(waiver.id)}
                  >
                    Archive
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeWaiver(waiver.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
