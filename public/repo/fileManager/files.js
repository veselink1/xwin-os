function getFiles(callback) {
    'use strict';

    interop.os.getGoogleService().getDriveClient(function(drive) {
        var fileCache = [];
        var fileTree = [];

        function getFiles(nextPageToken, getAllFiles) {

            var request;

            if (nextPageToken) {
                request = drive.files.list({
                    pageSize: 100,
                    fields: "nextPageToken, files(id, name)",
                    nextPageToken: nextPageToken,
                });
            } else {
                request = drive.files.list({
                    pageSize: 100,
                    fields: "nextPageToken, files(id, name)",
                });
            }

            request.execute(function(resp) {
                var files = resp.files;
                if (files && files.length > 0) {
                    fileCache = fileCache.concat(files);
                    if (getAllFiles) {
                        getFiles(callback, resp.nextPageToken, true);
                    } else {
                        callback(files);
                    }
                } else if (files) {
                    callback(files);
                } else {
                    callback(null)
                }
            });

        }

        window.getFiles = getFiles;

    });
}