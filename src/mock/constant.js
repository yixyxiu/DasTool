
export  const POSITIONS = [
    [0, 0],
    [20, 0],
    [40, 0],
    [0, 20],
    [20, 20],
    [40, 20],
    [0, 40],
    [20, 40],
    [40, 40]
]

export const FIGURE_PATHS = [
    // square
    'M0 0h20v20H0z',
    // triangle
    'M0 0h20L0 20z',
    'M0 0l20 20H0z',
    'M20 0v20H0z',
    'M0 0h20v20z',
    // arc-shaped
    'M20 0v20H0C0 8.954 8.954 0 20 0z',
    'M0 0c11.046 0 20 8.954 20 20H0V0z',
    'M0 0h20v20C8.954 20 0 11.046 0 0z',
    'M0 0h20c0 11.046-8.954 20-20 20V0z',
    // half-angle
    'M10 0c5.523 0 10 4.477 10 10v10H0V10C0 4.477 4.477 0 10 0z',
    'M10 0h10v20H10C4.477 20 0 15.523 0 10S4.477 0 10 0z',
    'M10 0h10v20H10C4.477 20 0 15.523 0 10S4.477 0 10 0z',
    'M0 0h20v10c0 5.523-4.477 10-10 10S0 15.523 0 10V0z',
    // Other
    'M10 0h10v10c0 5.523-4.477 10-10 10S0 15.523 0 10 4.477 0 10 0z',
    'M0 0h10c5.523 0 10 4.477 10 10s-4.477 10-10 10S0 15.523 0 10V0z',
    'M10 0c5.523 0 10 4.477 10 10v10H10C4.477 20 0 15.523 0 10S4.477 0 10 0z',
    'M10 0c5.523 0 10 4.477 10 10s-4.477 10-10 10H0V10C0 4.477 4.477 0 10 0z'
]

export const COLORS = [
    '#338CFF',
    '#FFDA23',
    '#C123FF',
    '#FFC12D',
    '#8221FF',
    '#D49742',
    '#FB23FF',
    '#009CFF',
    '#FF5423',
    '#07BF8B',
    '#2336FF',
    '#DE2E8F',
    '#FF2323',
    '#00C8BB',
    '#6500FF',
    '#DE2E62'
]

export function getPositions(domainMd5) {
    const _positionArray = []
    const _positionObject = {}
    for (let i = 0; i <= 8; i++) {
        _positionArray.push(domainMd5.substr(i * 3, 3))
    }
    _positionArray.sort()
    _positionArray.forEach((position, index) => {
        _positionObject[position] = POSITIONS[index]
    })
    return _positionObject
}

export function getColors(domainMd5) {
    const _strArray = []
    let _colorArray = []
    for (let i = 0; i <= 9; i++) {
        _strArray.push(domainMd5.substr(i * 2, 2))
    }
    _colorArray = _strArray.map((str) => {
        return (str.charCodeAt(0) + str.charCodeAt(1)) % 16
    })
    return _colorArray
}

export function getFigurePaths(domainMd5) {
    const _strArray = []
    let _figurePathArray = []
    for (let i = 0; i <= 8; i++) {
        _strArray.push(domainMd5.substr(i * 2, 2))
    }
    _figurePathArray = _strArray.map((str) => {
        return (str.charCodeAt(0) + str.charCodeAt(1)) % 17
    })
    return _figurePathArray
}
