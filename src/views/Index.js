import React from 'react';
import {Card, Space, Input, Button, Table, Alert, Avatar, Menu, Dropdown, Divider, Layout} from 'antd';
import {SearchOutlined, RedoOutlined, DownOutlined} from '@ant-design/icons';
import {Carousel} from "react-responsive-carousel";
import https from '../api/https';
import TextArea from 'antd/lib/input/TextArea';
import "react-responsive-carousel/lib/styles/carousel.min.css"
// import { polyfill } from 'spritejs/lib/platform/node-canvas'
import * as spritejs from 'spritejs';
import md5 from 'blueimp-md5'
import img from "../img/logo.png"
import {POSITIONS, FIGURE_PATHS, COLORS, getColors, getPositions, getFigurePaths} from "../mock/constant"

const {Footer} = Layout


var blake2b = require('blake2b');
//const { TextArea } = Input;
let das = require('../mock/registered.json');
das.suffixList = require('../mock/suffix.json');
das.reserved = require('../mock/reserved.json');
das.recommendList = require('../mock/recommendList.json');
das.banners = require('../mock/banners.json');

das.description = "DAS is a cross-chain decentralized account system with a .bit suffix, supporting ETH/TRX and other public chain. It can be used in scenes such as crypto transfers, domain name resolution, and identity authentication. "

let localeConfig = require('../mock/lang.json');

export default class AddShop extends React.Component {
    state = {
        snsArr: [],
        keyword: '',
        locale: 'zh_CN',
        list: [],
        recommendList: [],
        banners: das.banners,
        keywordList: [],
        animationClass: 'dasAnimation',
        columns: [
            {
                dataIndex: 'avatar',
                key: 'name',
                width: 50,
                render: (text, record, index) => {
                    let id = `img${index}`
                    let dom = <div id={id} style={{width: "32px", height: "32px"}}></div>
                    setTimeout(() => {
                        this.getImg(id, record.name)
                    }, 100)
                    return dom
                },
            },
            {
                title: '可选账号',
                dataIndex: 'name',
                key: 'name',
            },
            // {
            //   title: '状态',
            //   render: record => (
            //     <Space size="middle">
            //         {record.status==0?'检测种':'可注册'}
            //     </Space>
            //   )
            // },
            {
                title: '操作',
                width: 100,
                key: 'action',
                align: 'right',
                render: record => {

                    return <Space size="middle">
                        <Button type="primary" size={'normal'} shape="round"
                                onClick={() => this.add(record)}>{this.langConfig('register-btn')}</Button>
                    </Space>
                },
            },

        ]
    };

    async getImg(id, name) {
        const {Scene, Sprite, Rect, Ring, Path} = spritejs;
        const nameMd5 = md5(name)
        const _colors = getColors(nameMd5)
        const _positions = getPositions(nameMd5)
        const _figurePaths = getFigurePaths(nameMd5)
        const _size = 60
        const _center = 30
        let container = document.getElementById(id)
        const scene = new Scene({
            container,
            width: _size,
            height: _size,
            displayRatio: 2,
        })
        const layer = scene.layer()
        // background
        const rect = new Rect({
            normalize: true,
            pos: [_center, _center],
            size: [_size, _size],
            fillColor: COLORS[_colors[8]]
        })
        layer.append(rect)
        // figure
        for (let i = 0; i <= 8; i++) {
            const p = new Path()
            const pos = _positions[nameMd5.substr(i * 3, 3)]
            const d = FIGURE_PATHS[_figurePaths[i]]
            const fillColor = COLORS[_colors[i + 1]]
            p.attr({
                pos,
                d,
                fillColor
            })
            layer.appendChild(p)
        }
        // logo
        const logoSprite = new Sprite(img);
        logoSprite.attr({
            pos: [0, 0],
            size: [_size, _size]
        })
        layer.appendChild(logoSprite)
        // ring background
        const ringBg = new Ring({
            pos: [_center, _center],
            innerRadius: 29,
            outerRadius: 45,
            fillColor: '#FFFFFF'
        })
        layer.append(ringBg)
        //
        // ring
        const ring = new Ring({
            pos: [_center, _center],
            innerRadius: 29,
            outerRadius: _center,
            fillColor: COLORS[_colors[0]],
            opacity: 0.2
        })
        layer.append(ring)
    }

    textAreaChange = e => {
        let article = e.target.value
        let wordList = article.match(/[a-z0-9]+/gi);

        if (wordList) {
            wordList = [...new Set(wordList)].sort(function (a, b) {
                return a.length - b.length;
            });
        }

        this.setState({snsArr: (wordList ? wordList : "")});
    }

    search = () => {

        let reserved = das.reserved;
        let registered = das.registered;
        let data = this.state.snsArr;
        let result = [];
        let arr = [];
        for (let i = 0; i < data.length; i++) {
            let item = data[i];

            //去标点符号并转小写
            item = item.replace(/\s/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
            //过滤非数字和字母组合
            if (/^[a-zA-Z\d]+$/.test(item)) {
                if (this.canRegister(item)) {
                    let account = item + '.bit';
                    if (!arr.includes(account) && !reserved.includes(account) && !registered.includes(account)) {
                        arr.push(account);
                        result.push({
                            id: result.length + 1,
                            status: 0,
                            name: account
                        })
                    }
                }
            }
        }

        if (result.length == 0) {
            this.refreshRecommendList();
        }

        //console.log(result)
        this.setState({
            list: result
        });
    }


    // 校验一个账号是否已开放注册，用于 5- 9 位账号
    // 5-9 位，只开放 5 % 采用 blake2b 算法对账户名(包含 .bit 后缀)进行 hash ，取 hash 结果的第 1 个字节作为一个 u8 整数，当该整数小于等于 12 时，即可注册。
    canRegister = text => {

        if (text.length < 5)
            return false;

        // 虽然 > 10 < 47 位都可以注册，但考虑到太长的账号没意义，在此只用15个字符以内的
        if (text.length > 9 && text.length < 15)
            return true;

        // 5-9 位的，算法决定
        text += '.bit';
        var hash = blake2b(32, null, null, Buffer.from('2021-07-22 12:00'));
        hash = hash.update(Buffer.from(text));
        var output = new Uint8Array(32)
        var out = hash.digest(output);
        if (out[0] < 13) {
            //console.log(text,out[0])
            return true
        }

        return false
    }

    // 获取min 到 max 之间的随机数，包含min，不含 max
    getRandomInt = (min, max) => {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //不含最大值，含最小值
    }

    add = record => {
        window.open("https://app.gogodas.com/account/register/" + record.name + "?inviter=cryptofans.bit&channel=cryptofans.bit", "newW")
    }

    keywordChanged = e => {
        let snsArr = e.target.value

        snsArr = snsArr.replace(/\s/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        console.log(snsArr)

        this.setState({keyword: snsArr});
    }

    keywordSearch = () => {
        let reserved = das.reserved;
        let registered = das.registered;
        let keyword = this.state.keyword;
        let result = [];

        keyword = keyword.replace(/\s/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        for (let i = 0; i < das.suffixList.length; i++) {
            let accountName = keyword + das.suffixList[i];
            // 只在结果集里显示 10 位以下的可注册账号
            if (this.canRegister(accountName) && accountName.length < 10) {
                let account = accountName + '.bit';
                // 排除
                if (!reserved.includes(account) && !registered.includes(account)) {
                    result.push({
                        id: result.length + 1,
                        status: 0,
                        name: account
                    })
                }
            }
        }

        //console.log(result)
        this.setState({
            keywordList: result
        });
    }

    refreshRecommendList = () => {

        let reserved = das.reserved;
        let registered = das.registered;
        let result = [];
        let arr = [];

        // 最多输出 10个
        while (result.length < 10) {
            let index = this.getRandomInt(0, das.recommendList.length);
            let item = das.recommendList[index];
            if (this.canRegister(item)) {
                let account = item + '.bit';
                // 排除
                if (!arr.includes(account) && !reserved.includes(account) && !registered.includes(account)) {
                    arr.push(item);
                    result.push({
                        id: result.length + 1,
                        status: 0,
                        name: account
                    })
                }
            }
        }

        //console.log(result)
        this.setState({
            recommendList: result
        });
    }

    sleep = async (text, idx) => {
        let that = this;
        return new Promise((resolve) => {
            https.fetchGet("https://autumnfish.cn/search", {'keywords': text})
                .then(data => {
                    let result = that.state.list;
                    result[idx].status = 1;
                    this.setState({
                        list: result
                    });
                    setTimeout(() => {
                        resolve();
                    }, 2000);
                })
        });
    }

    isReadyList = async (list) => {
        let strArr = ['晴天', '阴天', '雨天', '彩虹', '海底'];
        for (var i = 0; i < list.length; i++) {
            let item = list[i];
            /* 等待0.2s */
            await this.sleep(item.name, i);
        }
    }

    changeLanguage = (language) => {
        //把用户的语言写入缓存，供下次获取使用
        localStorage.setItem('locale', language)

        this.setState({locale: language});

        console.log(this.state.locale);
    }

    componentDidMount() {

        let language = localStorage.getItem('locale') || window.navigator.language.toLowerCase() || 'en';

        //判断用户的语言，跳转到不同的地方
        if (language.indexOf("zh-") !== -1) {
            language = "zh_CN";
        } else if (language.indexOf('en') !== -1) {
            language = "en_US";
        } else {
            //其它的都使用英文
            language = "en_US";
        }

        this.changeLanguage(language);
    }

    langConfig = (key) => {
        let locale = this.state.locale;

        return localeConfig[locale][key];
    }

    /*
        onLangMenuClick = ({ key }) => {
            this.state.locale = key;
          };
    */


    render() {
        const {list, recommendList, keywordList, columns} = this.state

        const onLangMenuClick = ({key}) => {
            this.changeLanguage(key)
        };

        const onClickCarouselItem = (index, item) => {
            console.log(this.state.banners[index].link);
            window.open(this.state.banners[index].link);
        };

        const menu = (
            <Menu onClick={onLangMenuClick}>
                <Menu.Item key="zh_CN">简体中文</Menu.Item>
                <Menu.Item key="en_US">English</Menu.Item>
            </Menu>
        );
        // 修改标题
        document.title = this.langConfig('app-name');
        return (
            <div className={this.state.animationClass}>
                <div className="content">
                    <div className="bannerWraper">
                        <Carousel
                            autoPlay={true}
                            showStatus={false}
                            showThumbs={false}
                            infiniteLoop
                            centerMode
                            emulateTouch
                            swipeable
                            centerSlidePercentage={75}
                            onClickItem={onClickCarouselItem}
                        >
                            {this.state.banners.map((value, index) => {
                                return <div><img alt="" src={value.image}/></div>;
                            })}
                        </Carousel>
                    </div>
                    <Card title={this.langConfig('app-name')} bordered={false}>
                        <div style={{
                            display: 'inline-block',
                            position: 'absolute',
                            right: 15,
                            top: 18,
                            textAlign: 'right'
                        }}>
                            <Dropdown overlay={menu}>
                                <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
                                    {this.langConfig('lang')} <DownOutlined/>
                                </a>
                            </Dropdown>
                            <Divider type="vertical"/>
                            <a style={{color: '#1890ff'}}
                               href="https://da.systems/explorer?inviter=cryptofans.bit&channel=cryptofans.bit&locale=zh-CN&utm_source=cryptofans+">{this.langConfig('about-das')}</a>
                        </div>

                        <Alert message={this.langConfig('wordlist-tips')} type="info"/>
                        <br/>
                        <div style={{position: 'relative', paddingRight: 100}}>
                            <TextArea onChange={(e) => this.textAreaChange(e)} allowClear placeholder={das.description}
                                      rows={4}/>
                            <div style={{
                                display: 'inline-block',
                                position: 'absolute',
                                right: 15,
                                top: 0,
                                width: 70,
                                textAlign: 'right'
                            }}>
                                <Button type="primary" shape="round" icon={<SearchOutlined/>}
                                        onClick={() => this.search()}>{this.langConfig('wordlist-search')}</Button>
                            </div>
                        </div>
                        <br/>
                        <Table rowKey={(item) => item.id} dataSource={list} columns={columns}
                               rowClassName='das-account-name' showHeader={false}/>
                        <br/>
                    </Card>
                    <br/>
                    <Card title={this.langConfig('keyword-title')} bordered={false}>
                        <Alert message={this.langConfig('keyword-tips')} type="info"/>
                        <br/>
                        <div style={{position: 'relative', paddingRight: 100}}>
                            <Input onBlur={(e) => this.keywordChanged(e)} placeholder="defi" allowClear maxLength={10}
                                   rows={1} style={{textAlign: 'right'}}/>
                            <div style={{
                                display: 'inline-block',
                                position: 'absolute',
                                right: 15,
                                top: 0,
                                width: 70,
                                textAlign: 'right'
                            }}>
                                <Button type="primary" shape="round" icon={<SearchOutlined/>}
                                        onClick={() => this.keywordSearch()}>{this.langConfig('keyword-search')}</Button>
                            </div>
                        </div>
                        <br/>
                        <Table rowKey={(item) => item.id} dataSource={keywordList} columns={columns}
                               rowClassName='das-account-name' showHeader={false}/>
                        <br/>
                    </Card>
                    <br/>
                    <Card title={this.langConfig('recommend-title')} bordered={false}
                          extra={<Button type="primary" shape="round" danger icon={<RedoOutlined/>}
                                         onClick={() => this.refreshRecommendList()}>{this.langConfig('recommend-change-list')}</Button>}>
                        <Alert
                            message={this.langConfig('recommend-warning')}
                            description={this.langConfig('recommend-tips')}
                            type="warning"
                            showIcon
                        />
                        <br></br>
                        <Table rowKey={(item) => item.id} dataSource={recommendList} columns={columns}
                               rowClassName='das-account-name' showHeader={false}/>
                        <br/>
                    </Card>
                    <br/>
                </div>
            </div>
        )

    }
}
