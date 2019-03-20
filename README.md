# Regex

This class gets all matches, with start and end position, within the string, for a given regexp.

From high level the source code is:
 
 1. Ensuring that each character is captured by a group: eg. /ab(cd)ef/ => /(ab)(cd)(ef)/
 2. Calling exec on the converted regexp with a given string
 3. Summing lengths of previous groups for start position of current group, add length of current group for end position 

## API

#### Regex(baseRegExp: Regexp)

will setup parsed regexp, returns instance

#### getFullDetails(subject: string)

will find the full match and all matching groups, returns {match: string, start: number, end: number, group: 
number}[]

#### getGroupsDetails(subject: string)

will find all matching groups, returns {match: string, start: number, end: number, group: 
number}[]

#### getGroupDetails(subject: string, group:number)

will find given group details, returns {match: string, start: number, end: number}

## Usage
```
let regex = new Regex(/a(?: )bc(def(ghi)xyz)/g),
    result = regex.getFullDetails('ababa 
bcdefghixyzXXXX');

console.log(result);
```

Will output:
```
/**
 * [ 
 *  { match: 'a bcdefghixyz', start: 4, end: 17, group: 0 },
 *  { match: 'defghixyz', start: 8, end: 17, group: 1 },
 *  { match: 'ghi', start: 11, end: 14, group: 2 } 
 * ]
 */
```

To get just groups details:

```
let matches = regex.getGroupsDetails('ababa bcdefghixyzXXXX');

/**
 * [ 
 *  { match: 'defghixyz', start: 8, end: 17, group: 1 },
 *  { match: 'ghi', start: 11, end: 14, group: 2 } 
 * ]
 */

```

To get just given group details:

```
let matches = regex.getGroupDetails('ababa bcdefghixyzXXXX', 2);

/**
 * { match: 'ghi', start: 11, end: 14, group: 2 }
 */
```
