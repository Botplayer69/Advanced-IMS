import { LogOut, UserCog } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ProfileMenu() {
  const accountName = "Arham Bhansali";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-md border border-border bg-card px-2 py-1.5 text-left ims-hover"
        >
          <Avatar className="h-7 w-7 border border-border">
            <AvatarImage
              src="https://api.dicebear.com/9.x/adventurer/svg?seed=Alex-Morgan"
              alt={accountName}
            />
            <AvatarFallback className="text-[10px] font-bold">AM</AvatarFallback>
          </Avatar>
          <span className="text-xs font-medium text-foreground">{accountName}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onSelect={() => toast.info("Profile settings clicked")}> 
          <UserCog className="h-4 w-4" />
          Profile settings
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => toast.info("Logout clicked")}> 
          <LogOut className="h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}