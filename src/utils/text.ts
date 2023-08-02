export function trimNewLines(str: string, delimeter?: string) {
    const stringParts = str.split('\n');
    if (stringParts.length === 0) {
        return str;
    }

    let formattedStrings = stringParts.map(part => part.trimStart());

    if (delimeter) {
        formattedStrings = formattedStrings.map(str => `${delimeter} ${str}`);
    }

    return formattedStrings.join('\n');
}