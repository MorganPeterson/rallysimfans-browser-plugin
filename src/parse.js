// Convert "MM:SS.mmm" or "H:MM:SS.mmm" to total seconds. Returns null on failure.
export function parseTimeToSeconds(timeStr) {
    if (typeof timeStr !== 'string') return null;

    const s = timeStr.trim();
    if (!s || s === '-' || s.toLowerCase() === 'n/a') return null;

    const parts = s.split(':').map(p => p.trim());
    if (parts.length < 1 || parts.length > 3) return null;

    const intPattern = /^\d+$/;
    const lastPattern = /^\d+(?:[.,]\d+)?$/;

    // All non-final parts must be integers.
    for (let i = 0; i < parts.length - 1; i++) {
        if (!intPattern.test(parts[i])) return null;
    }

    // Final part may have decimals.
    if (!lastPattern.test(parts[parts.length - 1])) return null;

    const nums = parts.map((part, i) =>
        Number(i === parts.length - 1 ? part.replace(',', '.') : part)
    );

    if (nums.some(n => !Number.isFinite(n))) return null;

    if (parts.length === 1) {
        const [seconds] = nums;
        return seconds;
    }

    if (parts.length === 2) {
        const [minutes, seconds] = nums;

        if (minutes < 0) return null;
        if (seconds < 0 || seconds >= 60) return null;

        return minutes * 60 + seconds;
    }

    const [hours, minutes, seconds] = nums;

    if (hours < 0) return null;
    if (minutes < 0 || minutes >= 60) return null;
    if (seconds < 0 || seconds >= 60) return null;

    return hours * 3600 + minutes * 60 + seconds;
}

export function parseDiffToSeconds(str) {
    if (typeof str !== 'string') return null;

    const s = str.trim();
    if (!s || s.includes('-')) return null;

    if (!s.includes(':')) {
        if (!/^\d+(?:[.,]\d+)?$/.test(s)) return null;
        const seconds = Number(s.replace(',', '.'));
        return Number.isFinite(seconds) ? seconds : null;
    }

    return parseTimeToSeconds(s);
}


// Extract km from "13.4 km", "9,7 km", etc.
export function parseKm(lenStr) {
    if (typeof lenStr !== 'string') return null;

    const s = lenStr.trim();
    if (!s) return null;

    const match = s.match(/^(\d+(?:[.,]\d+)?)\s*km$/i);
    if (!match) return null;

    const km = Number(match[1].replace(',', '.'));
    return Number.isFinite(km) ? km : null;
}
