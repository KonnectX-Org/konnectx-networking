export const badgeLevels = [
    { range: [0, 1], badgeName: "Parmanu", level: 1, subText: "For those building the foundation of limitless potential." },
    { range: [2, 10], badgeName: "Nakshatra", level: 2, subText: "For those guidedby the brilliance of their network." },
    { range: [11, 25], badgeName: "Chandra", level: 3, subText: "For those illuminating connections with a soothing glow." },
    { range: [26, 50], badgeName: "Shani", level: 4, subText: "For those mastering the long game with strategy and patience." },
    { range: [51, Infinity], badgeName: "Surya", level: 5, subText: "For those radiating confidence in every interaction." }
];

export const getBadgeInfo = (connections: number) => {
    const badge = badgeLevels.find(badge => connections >= badge.range[0] && connections <= badge.range[1]);
    if (badge) {
        const { badgeName, level, subText } = badge;
        return { badgeName, level, subText };
    }
    return null;
};
