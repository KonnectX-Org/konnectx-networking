export interface RequirementI {
  _id: string;
  title: string;
  description: string;
  budget?: number;
  currency?: string;
  locationPreference?: string;
  postedBy: {
    _id: string;
    name: string;
    profileImage: string;
  };
  membersCount: number;
  bidderProfileImages: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RequirementsPaginationI {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  limit: number;
}

export interface RequirementsResponseI {
  success: boolean;
  data: RequirementI[];
  pagination: RequirementsPaginationI;
}

export interface RequirementResponseI {
  _id: string;
  requirementId: string;
  postedBy: string;
  bidderId: {
    _id: string;
    name: string;
    profileImage: string;
    position: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface RequirementDetailI extends RequirementI {
  responses?: RequirementResponseI[];
  isUserPosted?: boolean;
  myResponse?: { _id: string };
}

export interface RequirementDetailResponseI {
  success: boolean;
  data: RequirementDetailI;
}
