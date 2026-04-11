export declare class CreateActionDto {
    actionType: 'delete_own' | 'archive_own' | 'privatize_own' | 'friendly_request' | 'escalate_platform' | 'escalate_search' | 'escalate_urgent';
    bulk?: boolean;
    customMessage?: string;
}
