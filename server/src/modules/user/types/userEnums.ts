export enum AccountStatusEnum {
    ACTIVE               =   'ACTIVE',                        // Account is active and fully operational.
    PENDING_VERIFICATION =   'PENDING_VERIFICATION',          // Account is awaiting email verification or admin approval.
    SUSPENDED            =   'SUSPENDED',                     // Account is temporarily suspended (e.g., due to policy violations).
    CLOSED               =   'CLOSED',                        // Account has been closed (voluntary or due to violation).
    BANNED               =   'BANNED',                        // Account has been permanently banned (e.g., for illegal activities).
    INACTIVE             =   'INACTIVE',                      // Account is inactive, often due to a long period of no activity.
    LOCKED               =   'LOCKED',                        // Account is temporarily locked due to security concerns (e.g., failed logins).
    EXPIRED              =   'EXPIRED',                       // Account or subscription has expired (e.g., subscription ended).
}