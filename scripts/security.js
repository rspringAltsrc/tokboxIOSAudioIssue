var EcsTs;
(function (EcsTs) {
    var Security;
    (function (Security_1) {
        function securityFactory(global) {
            return global ? global.security = new Security() :
                new Security();
        }
        Security_1.securityFactory = securityFactory;
        var Security = /** @class */ (function () {
            function Security() {
                var _this = this;
                this.checkPermission = function (wp, permission) {
                    var wpPermissions = _this.Permissions[wp];
                    var p = EcsTs.Permissions[permission];
                    return wpPermissions[p];
                };
                this.getPermissions = function () {
                    var config = {
                        cache: true,
                        type: 'HEAD',
                        url: window.location.toString(),
                        success: function (data, textStatus, request) {
                            //This is hard coded for the tokbox support case.
                            _this._permissions = {
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
                                },
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
                                }
                            };
                        },
                        error: function (request) {
                            _this._permissions = JSON.parse(request.getResponseHeader('permissions'));
                        }
                    };
                    return $.ajax(config);
                };
            }
            Object.defineProperty(Security.prototype, "Permissions", {
                get: function () {
                    return this._permissions;
                },
                enumerable: true,
                configurable: true
            });
            return Security;
        }());
    })(Security = EcsTs.Security || (EcsTs.Security = {}));
})(EcsTs || (EcsTs = {}));