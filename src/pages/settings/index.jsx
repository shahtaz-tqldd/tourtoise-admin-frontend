import { useState } from "react";

import { FileText, LogOut, ShieldCheck, UserRound } from "lucide-react";

import { Title } from "@/components/ui/typography";
import useAuth from "@/hooks/useAuth";
import PasswordUpdateDialog from "./accounts/password-update-dialog";
import ActivityLogs from "./accounts/activity-logs";
import AccountInfo from "./accounts/account-info";
import LegalContent from "./documents/legal-content";
import TabMenu from "@/components/ui/tab";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { userLoggedOut } from "@/features/auth/authSlice";
import { resetApiState } from "@/features/api/apiSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const PAGE_TABS = [
  { value: "account", label: "Account & security", icon: UserRound },
  { value: "content", label: "Platform content", icon: FileText },
];

function AccountTab({ user, onProfilePreviewChange }) {
  const [passwordOpen, setPasswordOpen] = useState(false);
  return (
    <div className="space-y-6">
      <AccountInfo
        user={user}
        onProfilePreviewChange={onProfilePreviewChange}
        setPasswordOpen={setPasswordOpen}
      />
      <ActivityLogs />

      <PasswordUpdateDialog
        open={passwordOpen}
        onOpenChange={setPasswordOpen}
      />
    </div>
  );
}

const SettingsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("account");
  const [profilePreview, setProfilePreview] = useState("");
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const { user, isLoading } = useAuth();

  const handleLogout = () => {
    dispatch(userLoggedOut());
    dispatch(resetApiState());
    navigate("/login", { replace: true });
  };

  return (
    <section className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Title variant="lg">Account Settings</Title>
          <p className="mt-1 text-sm text-slate-500">
            Manage the platform owner account, security, and public policies.
          </p>
        </div>

        <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="!pr-5 !pl-4">
              <LogOut />
              Logout
            </Button>
          </DialogTrigger>

          <DialogContent className="rounded-3xl border-slate-200 sm:max-w-[460px]">
            <DialogHeader>
              <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <LogOut className="h-5 w-5" />
              </div>
              <DialogTitle>Log out of Tourtoise?</DialogTitle>
              <DialogDescription className="pt-1 leading-6">
                Your current admin session will end, and you will need to sign
                in again to manage the platform.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="mt-3">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button variant="destructive" onClick={handleLogout}>
                <LogOut />
                Yes, log out
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <TabMenu
        tabs={PAGE_TABS}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        className="sticky -top-8 z-20 overflow-hidden md:rounded-t-2xl bg-gray-50 pt-2 -mx-8 px-8"
      />

      {isLoading && activeTab === "account" ? (
        <div className="grid animate-pulse gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="h-[360px] rounded-3xl bg-slate-200" />
          <div className="h-[360px] rounded-3xl bg-slate-200" />
        </div>
      ) : (
        <>
          {activeTab === "account" && (
            <AccountTab
              user={
                profilePreview ? { ...user, avatar_url: profilePreview } : user
              }
              onProfilePreviewChange={setProfilePreview}
            />
          )}
          {activeTab === "content" && <LegalContent />}
        </>
      )}
    </section>
  );
};

export default SettingsPage;
