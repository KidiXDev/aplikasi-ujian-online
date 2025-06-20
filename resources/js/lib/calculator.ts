export const Seconds = function (seconds: number): number {
    return seconds * 1000;
};

export const Minutes = function (minutes: number): number {
    return Seconds(minutes * 60);
};

export const Hours = function (hours: number): number {
    return Minutes(hours * 60);
};

export const Days = function (days: number): number {
    return Hours(days * 24);
};

export const Weeks = function (weeks: number): number {
    return Days(weeks * 7);
};

export const Months = function (months: number): number {
    return Days(months * 30);
};

export const Years = function (years: number): number {
    return Days(years * 365);
};
