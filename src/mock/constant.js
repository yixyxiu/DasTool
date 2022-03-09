
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

export const DASOPENEPOCH = [
    new Date('2021-09-17 02:00:00 GMT'),    //
        // todo 
    //new Date('2021-10-10 02:00:00 GMT'),
    //new Date('2021-10-17 03:00:00 GMT'),
    //new Date('2021-10-24 04:00:00 GMT'),
    //new Date('2021-10-31 05:00:00 GMT'),
    //new Date('2021-11-07 06:00:00 GMT'),
    //new Date('2021-11-14 07:00:00 GMT'),
    //new Date('2021-11-21 08:00:00 GMT'),
    //new Date('2021-11-28 09:00:00 GMT'),
    //new Date('2021-12-05 10:00:00 GMT'),
    //new Date('2021-12-12 11:00:00 GMT'),
    //new Date('2021-12-19 12:00:00 GMT'),
    //new Date('2021-12-26 13:00:00 GMT'),
    //new Date('2022-01-02 14:00:00 GMT'),
    //new Date('2022-01-09 15:00:00 GMT'),
    //new Date('2022-01-16 16:00:00 GMT'),
    //new Date('2022-01-23 17:00:00 GMT'),
    //new Date('2022-01-30 18:00:00 GMT'),
    //new Date('2022-02-06 19:00:00 GMT'),
    //new Date('2022-02-13 20:00:00 GMT'),
    //new Date('2022-02-20 21:00:00 GMT'),
    //new Date('2022-02-27 22:00:00 GMT'),
    //new Date('2022-03-06 23:00:00 GMT')
    new Date('2023-01-01 00:00:00 GMT')     //保留
];

export const TABLEFILTER = 
{
    "zh_CN":[
        {
            "name":"全部账号",
            "key":'-1',
            "iconClass":"fa fa-list-ul dropdown-icon-fa"
        },
        {
            "name":"可注册账号",
            "key":'0',
            "iconClass":"fa fa-check-circle dropdown-icon-fa"
        },
        {
            "name":"在售账号",
            "key":'1',
            "iconClass":"fa fa-usd dropdown-icon-fa"
        },
        {
            "name":"未开放的账号",
            "key":'2',
            "iconClass":"fa fa-lock dropdown-icon-fa"
        },
        {
            "name":"已注册账号",
            "key":'3',
            "iconClass":"fa fa-registered dropdown-icon-fa"
        },
        {
            "name":"系统保留账号",
            "key":'4',
            "iconClass":"fa fa-certificate dropdown-icon-fa"
        },
        {
            "name":"注册中的账号",
            "key":'5',
            "iconClass":"fa fa-exclamation-circle dropdown-icon-fa"
        }
        
    ],
    "en_US":[
        {
            "name":"All Account",
            "key":'-1',
            "iconClass":"fa fa-list-ul dropdown-icon-fa"
        },
        {
            "name":"Available",
            "key":'0',
            "iconClass":"fa fa-check-circle dropdown-icon-fa"
        },
        {
            "name":"On Sale",
            "key":'1',
            "iconClass":"fa fa-usd dropdown-icon-fa"
        },
        {
            "name":"Not yet Open Account",
            "key":'2',
            "iconClass":"fa fa-lock dropdown-icon-fa"
        },
        {
            "name":"Rigistered",
            "key":'3',
            "iconClass":"fa fa-registered dropdown-icon-fa"
        },
        {
            "name":"Reserved Account",
            "key":'4',
            "iconClass":"fa fa-certificate dropdown-icon-fa"
        },
        {
            "name":"Rigistering",
            "key":'5',
            "iconClass":"fa fa-exclamation-circle dropdown-icon-fa"
        }
    ]
};

export const DONATEADDRESS = 'ckb1qyqv6sge6as66xz2clgd8ffkjwgcaqv8t5asrghkn4';