export interface AzureDevOpsWorkItem {
    id?: number;
    rev?: number;
    fields: WorkItemFields;
    relations?: WorkItemRelation[];
    _links?: WorkItemLinks;
    url?: string;
}

export interface WorkItemFields {
    'System.Id'?: number;
    'System.Rev'?: number;
    'System.AreaPath'?: string;
    'System.TeamProject'?: string;
    'System.IterationPath'?: string;
    'System.WorkItemType'?: string;
    'System.State'?: string;
    'System.Reason'?: string;
    'System.AssignedTo'?: WorkItemUser;
    'System.CreatedDate'?: string;
    'System.CreatedBy'?: WorkItemUser;
    'System.ChangedDate'?: string;
    'System.ChangedBy'?: WorkItemUser;
    'System.CommentCount'?: number;
    'System.Title'?: string;
    'System.BoardColumn'?: string;
    'System.BoardColumnDone'?: boolean;
    'Microsoft.VSTS.Common.StateChangeDate'?: string;
    'Microsoft.VSTS.Common.ActivatedDate'?: string;
    'Microsoft.VSTS.Common.ActivatedBy'?: WorkItemUser;
    'Microsoft.VSTS.Common.ResolvedDate'?: string;
    'Microsoft.VSTS.Common.ResolvedBy'?: WorkItemUser;
    'Microsoft.VSTS.Common.ResolvedReason'?: string;
    'Microsoft.VSTS.Common.ClosedDate'?: string;
    'Microsoft.VSTS.Common.ClosedBy'?: WorkItemUser;
    'Microsoft.VSTS.Common.Priority'?: number;
    'Microsoft.VSTS.Common.Severity'?: string;
    'System.Description'?: string;
    'System.History'?: string;
    'Microsoft.VSTS.Common.AcceptanceCriteria'?: string;
    'Microsoft.VSTS.Scheduling.Effort'?: number;
    'Microsoft.VSTS.Scheduling.StoryPoints'?: number;
    'Microsoft.VSTS.Scheduling.OriginalEstimate'?: number;
    'Microsoft.VSTS.Scheduling.RemainingWork'?: number;
    'Microsoft.VSTS.Scheduling.CompletedWork'?: number;
    'System.Tags'?: string;
    [key: string]: any;
}

export interface WorkItemUser {
    displayName: string;
    uniqueName: string;
    id: string;
    descriptor?: string;
}

export interface WorkItemRelation {
    rel: string;
    url: string;
    attributes?: Record<string, any>;
}

export interface WorkItemLinks {
    self?: { href: string };
    workItemUpdates?: { href: string };
    workItemRevisions?: { href: string };
    workItemComments?: { href: string };
    html?: { href: string };
    workItemType?: { href: string };
    fields?: { href: string };
}

export interface CreateWorkItemRequest {
    op: 'add' | 'replace' | 'remove' | 'test' | 'move' | 'copy';
    path: string;
    from?: string;
    value?: any;
}

export interface UpdateWorkItemRequest extends CreateWorkItemRequest {}

export interface WorkItemQueryResult {
    queryType: string;
    queryResultType: string;
    asOf: string;
    columns: WorkItemQueryColumn[];
    sortColumns: WorkItemQuerySortColumn[];
    workItems: WorkItemReference[];
    workItemRelations?: WorkItemRelation[];
}

export interface WorkItemQueryColumn {
    referenceName: string;
    name: string;
    url: string;
}

export interface WorkItemQuerySortColumn {
    field: WorkItemQueryColumn;
    descending: boolean;
}

export interface WorkItemReference {
    id: number;
    url: string;
}

export interface WorkItemBatch {
    ids: number[];
    fields?: string[];
    asOf?: string;
    expand?: 'None' | 'Relations' | 'Fields' | 'Links' | 'All';
    errorPolicy?: 'Fail' | 'Omit';
}

export interface WorkItemBatchResponse {
    count: number;
    value: AzureDevOpsWorkItem[];
}

export interface WorkItemTypeCategory {
    name: string;
    referenceName: string;
    defaultWorkItemType?: WorkItemType;
    workItemTypes: WorkItemType[];
}

export interface WorkItemType {
    name: string;
    referenceName: string;
    description: string;
    color: string;
    icon: WorkItemIcon;
    isDisabled: boolean;
    xmlForm?: string;
    fieldInstances: WorkItemFieldInstance[];
    fields: WorkItemFieldReference[];
    transitions: WorkItemStateTransition[];
    states: WorkItemState[];
}

export interface WorkItemIcon {
    id: string;
    url: string;
}

export interface WorkItemFieldInstance {
    referenceName: string;
    name: string;
    url: string;
}

export interface WorkItemFieldReference {
    referenceName: string;
    name: string;
    url: string;
}

export interface WorkItemStateTransition {
    to: string;
    actions: string[];
}

export interface WorkItemState {
    name: string;
    color: string;
    category: string;
}

export interface AzureDevOpsApiError {
    $id: string;
    innerException?: any;
    message: string;
    typeName: string;
    typeKey: string;
    errorCode: number;
    eventId: number;
}

export interface AzureDevOpsApiResponse<T = any> {
    count?: number;
    value: T;
}

export interface ProjectReference {
    id: string;
    name: string;
    description?: string;
    url: string;
    state: 'deleting' | 'new' | 'wellFormed' | 'createPending' | 'all' | 'unchanged' | 'deleted';
    revision: number;
    visibility: 'private' | 'public';
    lastUpdateTime: string;
}