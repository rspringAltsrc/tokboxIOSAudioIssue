namespace EcsTs.Security {
    export function securityFactory(global?: any) {
        return global ? global.security = new Security() : 
            new Security();
    }

    class Security {
        private _permissions: IPermissionsList;
        

        public get Permissions(): any {
            return this._permissions;
        }

        checkPermission = (wp: WebPage, permission: Permissions): boolean => {
            const wpPermissions = this.Permissions[wp];
            const p = Permissions[permission];

            return wpPermissions[p];
        }

        getPermissions = (): JQueryXHR => {
            const config = {
                cache: true,
                type: 'HEAD',
                url: window.location.toString(),
                success: (data: any, textStatus: string, request: XMLHttpRequest) => {
                    this._permissions = {
                        "10": {
                            "View": true,
                            "Add": true,
                            "Edit": true,
                            "DeleteUndelete": true
                        },
                        "11": {
                            "View": true,
                            "Add": false,
                            "Edit": false,
                            "DeleteUndelete": false
                        },
                        "12": {
                            "View": true,
                            "Add": false,
                            "Edit": false,
                            "DeleteUndelete": false
                        },
                        "14": {
                            "View": true,
                            "Add": false,
                            "Edit": false,
                            "DeleteUndelete": false
                        },
                        "16": {
                            "View": true,
                            "Add": false,
                            "Edit": false,
                            "DeleteUndelete": false
                        },
                        "21": {
                            "View": true,
                            "Add": true,
                            "Edit": true,
                            "DeleteUndelete": true
                        },
                        "01": {
                            "View": true,
                            "Add": false,
                            "Edit": false,
                            "DeleteUndelete": false
                        },
                        "02": {
                            "View": true,
                            "Add": false,
                            "Edit": false,
                            "DeleteUndelete": false
                        },
                        "03": {
                            "View": true,
                            "Add": false,
                            "Edit": false,
                            "DeleteUndelete": false
                        },
                        "04": {
                            "View": true,
                            "Add": true,
                            "Edit": true,
                            "DeleteUndelete": false
                        },
                        "05": {
                            "View": true,
                            "Add": false,
                            "Edit": false,
                            "DeleteUndelete": false
                        },
                        "06": {
                            "View": true,
                            "Add": false,
                            "Edit": true,
                            "DeleteUndelete": false
                        },
                        "07": {
                            "View": true,
                            "Add": true,
                            "Edit": true,
                            "DeleteUndelete": false
                        },
                        "09": {
                            "View": true,
                            "Add": false,
                            "Edit": false,
                            "DeleteUndelete": false
                        }
                    };
                },
                error: (request: XMLHttpRequest) => {
                    this._permissions = JSON.parse(request.getResponseHeader('permissions'));
                }

            } as JQueryAjaxSettings;

            return $.ajax(config);
        }
    }

    export interface ISecurity
    {
        getPermissions: () => JQueryXHR;
        checkPermission: (wp: WebPage, permissions: Permissions) => boolean;
        Permissions: IPermissionsList;
    }

}

declare var security: EcsTs.Security.ISecurity;

declare module security {
};
