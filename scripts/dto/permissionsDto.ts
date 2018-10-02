namespace EcsTs {

    export interface IPermissions {
        View: boolean;
        Add: boolean;
        Edit: boolean;
        DeleteUndelete: boolean;
    }

    export enum Permissions {
        View,
        Add,
        Edit,
        DeleteUndelete
    }

    export enum WebPage {
        ClientGroups = 1,
        Clients = 2,
        ClientOffices = 3,
        ClientUsers = 4,
        Analysts = 5,
        Appraisers = 6, // Locate appraisers
        Shops = 7, // Locate shops
        Reports = 8,
        Assignments = 9, // New assignments
        MyList = 10,
        SecureHelpTopics = 11,
        SecureProgramGuidelines = 12,
        SendSalvage = 13,
        SecureHelpResources = 14,
        FileLibrary = 15,
        Search = 16, // Claim search
        ShopProgramNotes = 17,
        ShopSupportHistory = 18,
        QuestTowing = 19,
        GlassInvoice = 20, // Attachments, other
        Video = 21
    }

    export interface IPermissionsList {
        [K: number]: IPermissions
    }
}