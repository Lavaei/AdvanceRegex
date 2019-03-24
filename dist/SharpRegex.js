"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by Mostafa Lavaei
 */
var SharpRegex = /** @class */ (function () {
    function SharpRegex(baseRegExp) {
        var _a = this._fillGroups(baseRegExp), regexp = _a.regexp, groupIndexMapper = _a.groupIndexMapper, previousGroupsForGroup = _a.previousGroupsForGroup;
        this.regexp = regexp;
        this.groupIndexMapper = groupIndexMapper;
        this.previousGroupsForGroup = previousGroupsForGroup;
    }
    /**
     * Get all detail of full match and all groups details
     * @param {string} subject The subject string
     */
    SharpRegex.prototype.getFullDetails = function (subject) {
        var matches, firstIndex, indexMapper = Object.assign({ 0: 0 }, this.groupIndexMapper), previousGroups = Object.assign({ 0: [] }, this.previousGroupsForGroup), regexClone = this.regexp, result = [];
        while ((matches = regexClone.exec(subject)) !== null) {
            firstIndex = matches.index;
            result.push(Object.keys(indexMapper).map(function (group) {
                var mapped = indexMapper[group], start = firstIndex + previousGroups[group].reduce(function (sum, i) { return sum + (matches[i] ? matches[i].length : 0); }, 0);
                return {
                    match: matches[mapped],
                    start: start,
                    end: start + (matches[mapped] ? matches[mapped].length : 0),
                    group: parseInt(group)
                };
            }));
            if (regexClone.lastIndex == matches.index) {
                regexClone.lastIndex++;
            }
        }
        return result;
    };
    /**
     * Get all groups details
     * @param {string} subject The subject string
     */
    SharpRegex.prototype.getGroupsDetails = function (subject) {
        var matches = this.regexp.exec(subject), indexMapper = this.groupIndexMapper, previousGroups = this.previousGroupsForGroup, firstIndex, regexClone = this.regexp, result = [];
        while ((matches = regexClone.exec(subject)) !== null) {
            firstIndex = matches.index;
            result.push(Object.keys(indexMapper).map(function (group) {
                var mapped = indexMapper[group], start = firstIndex + previousGroups[group].reduce(function (sum, i) { return sum + (matches[i] ? matches[i].length : 0); }, 0);
                return {
                    match: matches[mapped],
                    start: start,
                    end: start + (matches[mapped] ? matches[mapped].length : 0),
                    group: parseInt(group)
                };
            }));
            if (regexClone.lastIndex == matches.index) {
                regexClone.lastIndex++;
            }
        }
        return result;
    };
    /**
     * Get details of given group
     * @param {string} subject The subject string
     * @param {number} group The group number
     */
    SharpRegex.prototype.getGroupDetails = function (subject, group) {
        var matches = this.regexp.exec(subject), mapped = group == 0 ? 0 : this.groupIndexMapper[group], previousGroups = group == 0 ? [] : this.previousGroupsForGroup[group], firstIndex, matchString, startIndex, endIndex, regexClone = this.regexp, result = [];
        while ((matches = regexClone.exec(subject)) !== null) {
            firstIndex = matches.index;
            matchString = matches[mapped];
            startIndex = firstIndex + previousGroups.reduce(function (sum, i) { return sum + (matches[i] ? matches[i].length : 0); }, 0);
            endIndex = startIndex + (matches[mapped] ? matches[mapped].length : 0);
            result.push({
                match: matchString,
                start: startIndex,
                end: endIndex,
            });
            if (regexClone.lastIndex == matches.index) {
                regexClone.lastIndex++;
            }
        }
        return result;
    };
    /**
     * Adds brackets before and after a part of string
     * @param str string the hole regex string
     * @param start int marks the position where ( should be inserted
     * @param end int marks the position where ) should be inserted
     * @param groupsAdded int defines the offset to the original string because of inserted brackets
     * @return {string}
     */
    SharpRegex.prototype._addGroupToRegexString = function (str, start, end, groupsAdded) {
        start += groupsAdded * 2;
        end += groupsAdded * 2;
        return str.substring(0, start) + '(' + str.substring(start, end + 1) + ')' + str.substring(end + 1);
    };
    /**
     * converts the given regex to a regex where all not captured string are going to be captured
     * it along sides generates a mapper which maps the original group index to the shifted group offset and
     * generates a list of groups indexes (including new generated capturing groups)
     * which have been closed before a given group index (unshifted)
     *
     * Example:
     * regexp: /a(?: )bc(def(ghi)xyz)/g => /(a(?: )bc)((def)(ghi)(xyz))/g
     * groupIndexMapper: {'1': 2, '2', 4}
     * previousGroupsForGroup: {'1': [1], '2': [1, 3]}
     *
     * @param regex RegExp
     * @return {{regexp: RegExp, groupIndexMapper: {}, previousGroupsForGroup: {}}}
     */
    SharpRegex.prototype._fillGroups = function (regex) {
        var regexString = regex.source, modifier = regex.flags, tester = /(\\\()|(\\\))|(\(\?)|(\()|(\)(?:{\d+,?\d*}|[*+?])?\??)/g, modifiedRegex = regexString, lastGroupStartPosition = -1, lastGroupEndPosition = -1, lastNonGroupStartPosition = -1, lastNonGroupEndPosition = -1, groupsAdded = 0, groupCount = 0, matchArr, nonGroupPositions = [], groupPositions = [], groupNumber = [], currentLengthIndexes = [], groupIndexMapper = {}, previousGroupsForGroup = {};
        var _loop_1 = function () {
            if (matchArr[1] || matchArr[2]) {
            }
            if (matchArr[3]) {
                var index = matchArr.index + matchArr[0].length - 1;
                lastNonGroupStartPosition = index;
                nonGroupPositions.push(index);
            }
            else if (matchArr[4]) {
                var index = matchArr.index + matchArr[0].length - 1, lastGroupPosition = Math.max(lastGroupStartPosition, lastGroupEndPosition);
                // if a (? is found add ) before it
                if (lastNonGroupStartPosition > lastGroupPosition) {
                    // check if between ) of capturing group lies a non capturing group
                    if (lastGroupPosition < lastNonGroupEndPosition) {
                        // add groups for x1 and x2 on (?:()x1)x2(?:...
                        if ((lastNonGroupEndPosition - 1) - (lastGroupPosition + 1) > 0) {
                            modifiedRegex = this_1._addGroupToRegexString(modifiedRegex, lastGroupPosition + 1, lastNonGroupEndPosition - 1, groupsAdded);
                            groupsAdded++;
                            lastGroupEndPosition = lastNonGroupEndPosition - 1; // imaginary position as it is not in regex but modifiedRegex
                            currentLengthIndexes.push(groupCount + groupsAdded);
                        }
                        if ((lastNonGroupStartPosition - 1) - (lastNonGroupEndPosition + 1) > 0) {
                            modifiedRegex = this_1._addGroupToRegexString(modifiedRegex, lastNonGroupEndPosition + 1, lastNonGroupStartPosition - 2, groupsAdded);
                            groupsAdded++;
                            lastGroupEndPosition = lastNonGroupStartPosition - 1; // imaginary position as it is not in regex but modifiedRegex
                            currentLengthIndexes.push(groupCount + groupsAdded);
                        }
                    }
                    else {
                        modifiedRegex = this_1._addGroupToRegexString(modifiedRegex, lastGroupPosition + 1, lastNonGroupStartPosition - 2, groupsAdded);
                        groupsAdded++;
                        lastGroupEndPosition = lastNonGroupStartPosition - 1; // imaginary position as it is not in regex but modifiedRegex
                        currentLengthIndexes.push(groupCount + groupsAdded);
                    }
                    // if necessary also add group between (? and opening bracket
                    if (index > lastNonGroupStartPosition + 2) {
                        modifiedRegex = this_1._addGroupToRegexString(modifiedRegex, lastNonGroupStartPosition + 2, index - 1, groupsAdded);
                        groupsAdded++;
                        lastGroupEndPosition = index - 1; // imaginary position as it is not in regex but modifiedRegex
                        currentLengthIndexes.push(groupCount + groupsAdded);
                    }
                }
                else if (lastGroupPosition < index - 1) {
                    modifiedRegex = this_1._addGroupToRegexString(modifiedRegex, lastGroupPosition + 1, index - 1, groupsAdded);
                    groupsAdded++;
                    lastGroupEndPosition = index - 1; // imaginary position as it is not in regex but modifiedRegex
                    currentLengthIndexes.push(groupCount + groupsAdded);
                }
                groupCount++;
                lastGroupStartPosition = index;
                groupPositions.push(index);
                groupNumber.push(groupCount + groupsAdded);
                groupIndexMapper[groupCount] = groupCount + groupsAdded;
                previousGroupsForGroup[groupCount] = currentLengthIndexes.slice();
            }
            else if (matchArr[5]) {
                var index = matchArr.index + matchArr[0].length - 1;
                if ((groupPositions.length && !nonGroupPositions.length) ||
                    groupPositions[groupPositions.length - 1] > nonGroupPositions[nonGroupPositions.length - 1]) {
                    if (lastGroupStartPosition < lastGroupEndPosition && lastGroupEndPosition < index - 1) {
                        modifiedRegex = this_1._addGroupToRegexString(modifiedRegex, lastGroupEndPosition + 1, index - 1, groupsAdded);
                        groupsAdded++;
                        //lastGroupEndPosition = index - 1; will be set anyway
                        currentLengthIndexes.push(groupCount + groupsAdded);
                    }
                    groupPositions.pop();
                    lastGroupEndPosition = index;
                    var toPush_1 = groupNumber.pop();
                    currentLengthIndexes.push(toPush_1);
                    currentLengthIndexes = currentLengthIndexes.filter(function (index) { return index <= toPush_1; });
                }
                else if (nonGroupPositions.length) {
                    nonGroupPositions.pop();
                    lastNonGroupEndPosition = index;
                }
            }
        };
        var this_1 = this;
        while ((matchArr = tester.exec(regexString)) !== null) {
            _loop_1();
        }
        return { regexp: new RegExp(modifiedRegex, modifier), groupIndexMapper: groupIndexMapper, previousGroupsForGroup: previousGroupsForGroup };
    };
    return SharpRegex;
}());
exports.SharpRegex = SharpRegex;
