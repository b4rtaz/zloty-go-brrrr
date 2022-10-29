exports.avgArray = (values) => {
    return values.reduce((a, b) => a + b, 0) / values.length;
};
