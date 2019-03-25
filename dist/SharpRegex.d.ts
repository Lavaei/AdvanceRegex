/**
 * Created by Mostafa Lavaei
 */
export declare class SharpRegex {
    protected regexp: RegExp;
    protected groupIndexMapper: {
        [key: number]: number;
    };
    protected previousGroupsForGroup: {
        [key: number]: number[];
    };
    constructor(baseRegExp: RegExp);
    /**
     * Get all detail of full match and all groups details
     * @param {string} subject The subject string
     */
    getFullDetails(subject: string): SharpRegexDetailsContract[][];
    /**
     * Get all groups details
     * @param {string} subject The subject string
     */
    getGroupsDetails(subject: string): SharpRegexDetailsContract[][];
    /**
     * Get details of given group
     * @param {string} subject The subject string
     * @param {number} group The group number
     */
    getGroupDetails(subject: string, group: number): SharpRegexDetailsContract[];
    /**
     * Adds brackets before and after a part of string
     * @param str string the hole regex string
     * @param start int marks the position where ( should be inserted
     * @param end int marks the position where ) should be inserted
     * @param groupsAdded int defines the offset to the original string because of inserted brackets
     * @return {string}
     */
    protected _addGroupToRegexString(str: any, start: any, end: any, groupsAdded: any): string;
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
    protected _fillGroups(regex: RegExp): {
        regexp: RegExp;
        groupIndexMapper: {
            [key: number]: number;
        };
        previousGroupsForGroup: {
            [key: number]: number[];
        };
    };
}
export interface SharpRegexDetailsContract {
    match: string;
    start: number;
    end: number;
    group?: number;
}
