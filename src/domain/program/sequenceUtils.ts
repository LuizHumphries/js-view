/**
 * Converts a numeric sequence to a letter label (A, B, C, ..., Z, AA, AB, etc.)
 * This is extracted to its own file to avoid circular dependencies.
 */
export function sequenceToLabel(sequence: number): string {
    let label = ''

    while (sequence >= 0) {
        label = String.fromCharCode(65 + (sequence % 26)) + label
        sequence = Math.floor(sequence / 26) - 1
    }
    return label
}
