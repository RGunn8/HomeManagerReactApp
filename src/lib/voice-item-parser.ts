const NUMBER_WORDS: Record<string, number> = {
    a: 1,
    an: 1,
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
    couple: 2,
    few: 3,
};

export type ParsedVoiceItem = {
    id: string;
    name: string;
    quantity: number;
};

function capitalize(value: string) {
    return value.length > 0 ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : value;
}

/** Splits a spoken grocery/inventory list into discrete "quantity + name" entries. */
export function parseVoiceItems(transcript: string): ParsedVoiceItem[] {
    const segments = transcript
        .split(/,|\b(?:and|also|plus)\b/gi)
        .map((segment) => segment.trim())
        .filter(Boolean);

    return segments
        .map((segment, index) => {
            const match = segment.match(/^(\d+|[a-z]+)\s+(?:of\s+)?(.+)$/i);
            let quantity = 1;
            let name = segment;
            if (match) {
                const [, quantityToken, rest] = match;
                const numericQuantity = Number(quantityToken);
                const wordQuantity = NUMBER_WORDS[quantityToken.toLowerCase()];
                const resolvedQuantity = Number.isInteger(numericQuantity) && numericQuantity > 0 ? numericQuantity : wordQuantity;
                if (resolvedQuantity) {
                    quantity = resolvedQuantity;
                    name = rest.trim();
                }
            }
            return { id: `${Date.now()}-${index}`, name: capitalize(name.trim()), quantity };
        })
        .filter((item) => item.name.length > 0);
}
