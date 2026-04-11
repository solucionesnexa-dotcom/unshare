export declare class CreateActionDto {
    actionType: 'delete_own' | 'archive_own' | 'privatize_own' | 'friendly_request' | 'escalate_platform';
    bulk?: boolean;
    customMessage?: string;
}
