/**
 * Created by Mostafa Lavaei
 */
export class SharpRegex
{
	protected regexp: RegExp;
	protected groupIndexMapper: { [key: number]: number };
	protected previousGroupsForGroup: { [key: number]: number[] };

	constructor(baseRegExp: RegExp)
	{
		const {regexp, groupIndexMapper, previousGroupsForGroup} = this._fillGroups(baseRegExp);

		this.regexp                 = regexp;
		this.groupIndexMapper       = groupIndexMapper;
		this.previousGroupsForGroup = previousGroupsForGroup;
	}

	/**
	 * Get all detail of full match and all groups details
	 * @param {string} subject The subject string
	 */
	getFullDetails(subject: string): SharpRegexDetailsContract[][]
	{
		let matches: RegExpExecArray,
		    indexMapper: { [key: number]: number }      = Object.assign({0: 0}, this.groupIndexMapper),
		    previousGroups: { [key: number]: number[] } = Object.assign({0: []}, this.previousGroupsForGroup),
		    regexClone: RegExp                          = this.regexp,
		    result: SharpRegexDetailsContract[][]       = [];

		while ((matches = regexClone.exec(subject)) !== null)
		{
			let firstIndex: number                       = matches.index,
			    localResult: SharpRegexDetailsContract[] = [];

			Object.keys(indexMapper).forEach((group) => {
				let mapped: number = indexMapper[group],
				    start: number  = firstIndex + previousGroups[group].reduce(
					    (sum, i) => sum + (matches[i] ? matches[i].length : 0), 0
				    ),
				    end: number    = start + (matches[mapped] ? matches[mapped].length : 0);


				if (group === "0" || end > start)
				{
					localResult.push(
						{
							match: matches[mapped],
							start: start,
							end  : end,
							group: parseInt(group)
						}
					);
				}
			});


			result.push(localResult);

			/**
			 * Prevent from infinite loop
			 */
			if (regexClone.lastIndex == firstIndex)
			{
				regexClone.lastIndex++;
			}
		}

		return result;
	}

	/**
	 * Get all groups details
	 * @param {string} subject The subject string
	 */
	getGroupsDetails(subject: string): SharpRegexDetailsContract[][]
	{
		let matches: RegExpExecArray                    = this.regexp.exec(subject),
		    indexMapper: { [key: number]: number }      = this.groupIndexMapper,
		    previousGroups: { [key: number]: number[] } = this.previousGroupsForGroup,
		    regexClone: RegExp                          = this.regexp,
		    result: SharpRegexDetailsContract[][]       = [];


		while ((matches = regexClone.exec(subject)) !== null)
		{

			let firstIndex: number                       = matches.index,
			    localResult: SharpRegexDetailsContract[] = [];

			Object.keys(indexMapper).forEach((group) => {
				let mapped: number = indexMapper[group],
				    start: number  = firstIndex + previousGroups[group].reduce(
					    (sum, i) => sum + (matches[i] ? matches[i].length : 0), 0
				    ),
				    end: number    = start + (matches[mapped] ? matches[mapped].length : 0);

				if (group === "0" || end > start)
				{
					localResult.push(
						{
							match: matches[mapped],
							start: start,
							end  : start + (matches[mapped] ? matches[mapped].length : 0),
							group: parseInt(group)
						}
					);
				}
			});


			result.push(localResult);

			/**
			 * Prevent from infinite loop
			 */
			if (regexClone.lastIndex == firstIndex)
			{
				regexClone.lastIndex++;
			}
		}

		return result;
	}

	/**
	 * Get details of given group
	 * @param {string} subject The subject string
	 * @param {number} group The group number
	 */
	getGroupDetails(subject: string, group: number): SharpRegexDetailsContract[]
	{
		let matches: RegExpExecArray                                = this.regexp.exec(subject),
		    mapped                                                  = group == 0 ? 0 : this.groupIndexMapper[group],
		    previousGroups                                          = group == 0 ? [] : this.previousGroupsForGroup[group],
		    firstIndex: number,
		    matchString: string,
		    startIndex: number,
		    endIndex: number,
		    regexClone: RegExp                                      = this.regexp,
		    result: SharpRegexDetailsContract[] = [];

		while ((matches = regexClone.exec(subject)) !== null)
		{

			firstIndex = matches.index;

			matchString = matches[mapped];

			startIndex = firstIndex + previousGroups.reduce(
				(sum, i) => sum + (matches[i] ? matches[i].length : 0), 0
			);

			endIndex = startIndex + (matches[mapped] ? matches[mapped].length : 0);


			result.push(
				{
					match: matchString,
					start: startIndex,
					end  : endIndex,
				}
			);

			/**
			 * Prevent from infinite loop
			 */
			if (regexClone.lastIndex == firstIndex)
			{
				regexClone.lastIndex++;
			}
		}

		return result;
	}


	/**
	 * Adds brackets before and after a part of string
	 * @param str string the hole regex string
	 * @param start int marks the position where ( should be inserted
	 * @param end int marks the position where ) should be inserted
	 * @param groupsAdded int defines the offset to the original string because of inserted brackets
	 * @return {string}
	 */
	protected _addGroupToRegexString(str, start, end, groupsAdded)
	{
		start += groupsAdded * 2;
		end += groupsAdded * 2;
		return str.substring(0, start) + '(' + str.substring(start, end + 1) + ')' + str.substring(end + 1);
	}

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
	protected _fillGroups(regex: RegExp)
	{
		let regexString: string                                 = regex.source,
		    modifier: string                                    = regex.flags,
		    tester: RegExp                                      = /(\\\()|(\\\))|(\(\?)|(\()|(\)(?:{\d+,?\d*}|[*+?])?\??)/g,
		    modifiedRegex: string                               = regexString,
		    lastGroupStartPosition: number                      = -1,
		    lastGroupEndPosition: number                        = -1,
		    lastNonGroupStartPosition: number                   = -1,
		    lastNonGroupEndPosition: number                     = -1,
		    groupsAdded: number                                 = 0,
		    groupCount: number                                  = 0,
		    matchArr: RegExpExecArray,
		    nonGroupPositions: number[]                         = [],
		    groupPositions: number[]                            = [],
		    groupNumber: number[]                               = [],
		    currentLengthIndexes: number[]                      = [],
		    groupIndexMapper: { [key: number]: number }         = {},
		    previousGroupsForGroup: { [key: number]: number[] } = {};

		while ((matchArr = tester.exec(regexString)) !== null)
		{
			if (matchArr[1] || matchArr[2])
			{ // ignore escaped brackets \(, \)

			}
			if (matchArr[3])
			{ // non capturing group (?
				let index = matchArr.index + matchArr[0].length - 1;

				lastNonGroupStartPosition = index;
				nonGroupPositions.push(index);
			}
			else if (matchArr[4])
			{ // capturing group (
				let index: number             = matchArr.index + matchArr[0].length - 1,
				    lastGroupPosition: number = Math.max(lastGroupStartPosition, lastGroupEndPosition);

				// if a (? is found add ) before it
				if (lastNonGroupStartPosition > lastGroupPosition)
				{
					// check if between ) of capturing group lies a non capturing group
					if (lastGroupPosition < lastNonGroupEndPosition)
					{
						// add groups for x1 and x2 on (?:()x1)x2(?:...
						if ((lastNonGroupEndPosition - 1) - (lastGroupPosition + 1) > 0)
						{
							modifiedRegex = this._addGroupToRegexString(modifiedRegex, lastGroupPosition + 1, lastNonGroupEndPosition - 1, groupsAdded);
							groupsAdded++;
							lastGroupEndPosition = lastNonGroupEndPosition - 1; // imaginary position as it is not in regex but modifiedRegex
							currentLengthIndexes.push(groupCount + groupsAdded);
						}

						if ((lastNonGroupStartPosition - 1) - (lastNonGroupEndPosition + 1) > 0)
						{
							modifiedRegex = this._addGroupToRegexString(modifiedRegex, lastNonGroupEndPosition + 1, lastNonGroupStartPosition - 2, groupsAdded);
							groupsAdded++;
							lastGroupEndPosition = lastNonGroupStartPosition - 1; // imaginary position as it is not in regex but modifiedRegex
							currentLengthIndexes.push(groupCount + groupsAdded);
						}
					}
					else
					{
						modifiedRegex = this._addGroupToRegexString(modifiedRegex, lastGroupPosition + 1, lastNonGroupStartPosition - 2, groupsAdded);
						groupsAdded++;
						lastGroupEndPosition = lastNonGroupStartPosition - 1; // imaginary position as it is not in regex but modifiedRegex
						currentLengthIndexes.push(groupCount + groupsAdded);
					}

					// if necessary also add group between (? and opening bracket
					if (index > lastNonGroupStartPosition + 2)
					{
						modifiedRegex = this._addGroupToRegexString(modifiedRegex, lastNonGroupStartPosition + 2, index - 1, groupsAdded);
						groupsAdded++;
						lastGroupEndPosition = index - 1; // imaginary position as it is not in regex but modifiedRegex
						currentLengthIndexes.push(groupCount + groupsAdded);
					}
				}
				else if (lastGroupPosition < index - 1)
				{
					modifiedRegex = this._addGroupToRegexString(modifiedRegex, lastGroupPosition + 1, index - 1, groupsAdded);
					groupsAdded++;
					lastGroupEndPosition = index - 1; // imaginary position as it is not in regex but modifiedRegex
					currentLengthIndexes.push(groupCount + groupsAdded);
				}

				groupCount++;
				lastGroupStartPosition = index;
				groupPositions.push(index);
				groupNumber.push(groupCount + groupsAdded);
				groupIndexMapper[groupCount]       = groupCount + groupsAdded;
				previousGroupsForGroup[groupCount] = currentLengthIndexes.slice();
			}
			else if (matchArr[5])
			{ // closing bracket ), )+, )+?, ){1,}?, ){1,1111}?
				let index: number = matchArr.index + matchArr[0].length - 1;

				if ((groupPositions.length && !nonGroupPositions.length) ||
					groupPositions[groupPositions.length - 1] > nonGroupPositions[nonGroupPositions.length - 1]
				)
				{
					if (lastGroupStartPosition < lastGroupEndPosition && lastGroupEndPosition < index - 1)
					{
						modifiedRegex = this._addGroupToRegexString(modifiedRegex, lastGroupEndPosition + 1, index - 1, groupsAdded);
						groupsAdded++;
						//lastGroupEndPosition = index - 1; will be set anyway
						currentLengthIndexes.push(groupCount + groupsAdded);
					}

					groupPositions.pop();
					lastGroupEndPosition = index;

					let toPush: number = groupNumber.pop();
					currentLengthIndexes.push(toPush);
					currentLengthIndexes = currentLengthIndexes.filter(index => index <= toPush);
				}
				else if (nonGroupPositions.length)
				{
					nonGroupPositions.pop();
					lastNonGroupEndPosition = index;
				}
			}
		}

		return {regexp: new RegExp(modifiedRegex, modifier), groupIndexMapper, previousGroupsForGroup};
	}
}

export interface SharpRegexDetailsContract
{
	match: string,
	start: number,
	end: number,
	group?: number
}