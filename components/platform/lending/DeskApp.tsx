"use client";

import type { DeskScreen } from "@/lib/platform/lending/routes";
import { isPublicDesk } from "@/lib/platform/lending/routes";
import {
  AddLender,
  BorrowerList,
  BorrowerProfile,
  Learning,
  LenderList,
  LenderProfile,
  NewBorrower,
} from "./PeopleViews";
import {
  DealDetail,
  DropDeal,
  FileDetail,
  FileRoom,
  FollowInbox,
  LeadEntry,
  ManualEntry,
  MatchPage,
  Pipeline,
  RequestDocs,
  SubmissionDesk,
} from "./PrivateViews";
import { IntakeWizard, OptionsPage, PortalHome, PublicFrame, UploadPage } from "./PublicViews";
import { LendingShell } from "./Shell";
import { DeskProvider } from "./session";

export function DeskApp({ screen }: { screen: DeskScreen }) {
  const body = renderScreen(screen);
  return (
    <DeskProvider>
      {isPublicDesk(screen) ? <PublicFrame>{body}</PublicFrame> : <LendingShell>{body}</LendingShell>}
    </DeskProvider>
  );
}

function renderScreen(screen: DeskScreen) {
  switch (screen.name) {
    case "submission":
      return <SubmissionDesk />;
    case "drop":
      return <DropDeal />;
    case "pipeline":
      return <Pipeline view={screen.view} />;
    case "entry":
      return <ManualEntry />;
    case "lead":
      return <LeadEntry />;
    case "deal":
      return <DealDetail id={screen.id} />;
    case "match":
      return <MatchPage id={screen.id} />;
    case "follow":
      return <FollowInbox />;
    case "files":
      return <FileRoom />;
    case "file":
      return <FileDetail id={screen.id} />;
    case "request":
      return <RequestDocs />;
    case "lenders":
      return <LenderList />;
    case "lender-new":
      return <AddLender />;
    case "lender":
      return <LenderProfile id={screen.id} />;
    case "borrowers":
      return <BorrowerList />;
    case "borrower-new":
      return <NewBorrower />;
    case "borrower":
      return <BorrowerProfile id={screen.id} />;
    case "learning":
      return <Learning />;
    case "portal":
      return <PortalHome />;
    case "upload":
      return <UploadPage />;
    case "options":
      return <OptionsPage />;
    case "intake":
      return <IntakeWizard />;
    default:
      return null;
  }
}
