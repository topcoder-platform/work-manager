export interface ICreateChallenge {
  publicSpecification: string;
  tag: string;
  prize: string;
  completed: string;
  successTitle: string;
  draftMessage: string;
  confirmLaunch: string;
  launchMessage: string;
  confirmCloseTask: string;
  taskCloseMessage: string;
  activationMessage: string;
  taskClosedMessage: string;
  active: string;
  workNamePrefix: string;
  type: string;
  status: string;
  challengeName: string;
  assignedMember: string;
  tagsLabel: string;
  prizeLabel: string;
  copilot: string;
  draft: string;
  loadingButtonText: string;
  pageTitle: string;
  expiredMessage: string;
  expiredPopupMessage: string;
  NDAFields: string[];
  markComplete: string;
  milestoneNameToSelect: string;
}

export enum WorkFormat {
  "Task" = "Task",
  "Challenge" = "Challenge",
  "First2Finish" = "First2Finish"
}

export enum WorkType {
  "Development" = "Development",
  Data_Science = 'Data Science',
  "Design" = "Design",
  QA = "Quality Assurance"
}