var _ = require('lodash');
var async = require('async');
module.exports = function (config) {

    var ovh = require('ovh')({
        endpoint: config.api.endpoint,
        appKey: config.api.key,
        appSecret: config.api.secret,
        consumerKey: config.api.consumerKey,
        debug: config.api.debug,
    });

    var listZones = function listZones(callback) {
        ovh.request('GET', '/domain/zone/', function (err, zones) {
            callback(err, zones);
        })
    };

    var getRecord = function getRecord(zone, id, callback) {
        ovh.request('GET', '/domain/zone/' + zone + '/record/' + id, function (err, record) {
            callback(err, record);
        });
    };

    var listRecords = function listRecords(zone, fieldType = null, callback) {
        listZones(function (err, zones) {
            if (!_.includes(zones, zone)) {
                return callback('Zone "' + zone + '" not found.', null);
            }
            if (!_.includes([null, 'A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'DMARC', 'DKIM', 'SRV', 'SPF'], fieldType)) {
                return callback('Invalid FieldType, only "A","AAAA","CNAME","MX", "DKIM", "SRV", "SPF", "DMARC", "NS" and "TXT" are valid.', "provided: "+ fieldType)
            }
            ovh.request('GET', '/domain/zone/' + zone + '/record/', { fieldType: fieldType }, function (err, recordIds) {
                async.map(recordIds, function (recordId, cb) {
                    getRecord(zone, recordId, cb);
                }, callback);
            })
        });
    };

    var createRecord = function createRecord(zone, subDomain, fieldType, target, callback) {
        // For validation
        listZones(function (err, zones) {

            if (!_.includes(zones, zone)) {
                return callback('Zone "' + zone + '" not found.', null);
            }
            if (!_.includes(['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'DMARC', 'DKIM', 'SRV', 'SPF'], fieldType)) {
                return callback('Invalid FieldType, only "A","AAAA","CNAME","MX", "DKIM", "SRV", "SPF", "DMARC", "NS" and "TXT" are valid.', null)
            }
            ovh.request('POST', '/domain/zone/' + zone + '/record/', {
                fieldType: fieldType,
                subDomain: subDomain,
                target: target,
                ttl: 0
            }, callback);
        });
    };

    var deleteRecord = function deleteRecord(zone, id, callback) {
        if (!Number.isInteger(Number(id))) {
            return callback('ID "' + id + '" is not a number.', null);
        }
        listZones(function (err, zones) {
            if (!_.includes(zones, zone)) {
                return callback('Zone "' + zone + '" not found.', null);
            }
            ovh.request('DELETE', '/domain/zone/' + zone + '/record/'+Number(id), callback);
        });
    };

    var deleteRecordByContent = function deleteRecordByContent(zone, subDomain, fieldType, target, callback) {
        listRecords(zone, function (err, records) {
            var toDeleteRecord = _.find(records, {
                fieldType: fieldType,
                zone: zone,
                subDomain: subDomain,
                target: target
            });

            if (toDeleteRecord) {
                deleteRecord(zone, toDeleteRecord.id, callback);
            } else {
                return callback('Record not found, nothing to delete', null);
            }
        });
    };

    var refreshZone = function refreshZone(zone, callback) {
        listZones(function (err, zones) {
            if (!_.includes(zones, zone)) {
                return callback('Zone "' + zone + '" not found.', null);
            }
            ovh.request('POST', '/domain/zone/' + zone + '/refresh', callback);

        });
    };

    return {
        listZones: listZones,
        getRecord: getRecord,
        listRecords: listRecords,
        createRecord: createRecord,
        deleteRecord: deleteRecord,
        deleteRecordByContent: deleteRecordByContent,
        refreshZone: refreshZone
    }

};