function makeRandFunction() {
    return function rand() {
        return Math.floor(Math.random() * 512) % 256;
    };
}
export const random = makeRandFunction();
