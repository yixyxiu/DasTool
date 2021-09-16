import React from 'react';
import {Card, Space, Input, Button, Table, Alert, Menu, Dropdown, Divider, message, Layout} from 'antd';
import {SearchOutlined, DownOutlined} from '@ant-design/icons';
import {Carousel} from "react-responsive-carousel";
import https from '../api/https';
import TextArea from 'antd/lib/input/TextArea';
import "react-responsive-carousel/lib/styles/carousel.min.css"
//import { polyfill } from 'spritejs/lib/platform/node-canvas'
import * as spritejs from 'spritejs';
import md5 from 'blueimp-md5'
import img from "../img/logo.png"
import {FIGURE_PATHS, COLORS, getColors, getPositions, getFigurePaths, DASOPENEPOCH} from "../mock/constant"

const {Footer} = Layout


var blake2b = require('blake2b');
//const { TextArea } = Input;
let das = require('../mock/registered.json');
das.suffixList = require('../mock/suffix.json');
das.reserved = require('../mock/reserved.json');
das.recommendList = require('../mock/recommendList.json');
das.banners = require('../mock/banners.json');

let localeConfig = require('../mock/lang.json');
let iconMap = new Map();
// 存放新注册且没有显示通知的账号列表
let newDASBornList = [];


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
        discordTimerId: 0,
        showNewDASTimerID: 0,
        loginTime: new Date(),
        columns: [
            {
                dataIndex: 'avatar',
                key: 'name',
                width: 50,
                render: (text, record, index) => {
                    if (false) {
                        let dom = iconMap.get(record.name);
                        console.log(dom)
                        return dom
                    }
                    else {
                        let nameMD5 = md5(record.name)
                        let id = `img${nameMD5}`
                        let dom = <div id={id} style={{width: "32px", height: "32px"}}></div>
                        setTimeout(() => {
                            this.getImg(id, record.name)
                        }, 10)
                        
                        return dom
                    }
                    
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
        
        let container = document.getElementById(id)
        //console.log(name)
        if (!container) {
            console.log('container is null');
            return;
        }
        // 用缓存
        if (iconMap.has(name)) {
            let child = container.lastElementChild;
            while (child) { 
                container.removeChild(child); 
                child = container.lastElementChild; 
            } 
            
            container.appendChild(iconMap.get(name));
 
            return;
        }

        const {Scene, Sprite, Rect, Ring, Path} = spritejs;
        const nameMd5 = md5(name)
        const _colors = getColors(nameMd5)
        const _positions = getPositions(nameMd5)
        const _figurePaths = getFigurePaths(nameMd5)
        const _size = 60
        const _center = 30

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

        // 先用cavas画出来，然后把canvas的东西转成base64的imgdata，删除canva标签，
        // 用这个imgdata添加一个img标签。
        const snapshotCanvas = scene.snapshot()
        const imgBuffer = snapshotCanvas.toDataURL('image/jpeg');
        
        let child = container.lastElementChild;
        while (child) { 
            container.removeChild(child); 
            child = container.lastElementChild; 
        } 
        
        let imgElement = document.createElement('img');
        imgElement.src = imgBuffer;
        //imgElement.width = imgElement.height = 32;
        imgElement.style = 'height: 32px; width: 32px; border-radius: 32px;';
        container.appendChild(imgElement);

        iconMap.set(name, imgElement);
        //console.log(iconMap);
    }

    textAreaChange = e => {
        let article = e.target.value
        let wordList = article.match(/[a-z0-9]+/gi);

        if (wordList) {
            wordList = [...new Set(wordList)].sort(function (a, b) {
                return a.length - b.length;
            });
        }

        this.state.snsArr = (wordList ? wordList : "");
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

        if (result.length === 0) {
            this.refreshRecommendList();
        }

        //console.log(result)
        this.setState({
            list: result
        });
    }

    // 数组转化成uint32
    toBeUint32 = (byteArray) => {
        if (!byteArray)
            return 0;
            
        let value = 0;
    //    for (var i = 0; i < byteArray.length; i++) {
    //        value = (value << 8) | byteArray[i];
    //    }
        for (var i = byteArray.length - 1; i >= 0; i--) {
            value = (value * 256) + byteArray[i];
        }

        return value;
    }

    // 获取当前时间可注册的值（前4字节转换成Uint32后）
    getCanRegistValue = (localTime) => {
        // let localTime = new Date();

        // 第一波之前，小于
        if (localTime < DASOPENEPOCH[0])
    	    return 1503238553;
        
        // 最后一波开放完之后
        if (localTime >= DASOPENEPOCH[DASOPENEPOCH.length-1])
            return 4294967295;

        let index = 0;
        // 处于中间的区间
        for (var j = 0; j < DASOPENEPOCH.length; j++) {
            //var tmp = DASOPENEPOCH[j].toUTCString();
            //console.log(tmp)
            
            if ((j < DASOPENEPOCH.length -1 ) && (localTime >= DASOPENEPOCH[j]) && (localTime < DASOPENEPOCH[j+1])) {
            	//console.log('find' + j)
                index = j;
                break;
            }
        }
		
        let value = 1503238553 + 4294967295*(65/24)*0.01*index
		//console.log(localTime + ' need:' + value)

        return value;
    }

    // 校验一个账号是否已开放注册，0917版本北京时间上午10点上线
    // 4-9 位，9 月 17 日 2:00 (UTC+0) 随机开放至 35 %；
    // 剩余的 65% 将在 24 周内逐步开放。
    // 逐步开放规则如下：
    // 从 9 月 26 日起，每周日的 00:00 (UTC+0) 开始开放，周日当天每整点开放一批，24 周后释放完毕。（即每周日 00:00、01:00、02:00、...、23:00 会有一批 DAS 账户开放）
    canRegister0917 = text => {

        if (text.length < 4)
            return false;

        // 虽然 > 10 < 47 位都可以注册，但考虑到太长的账号没意义，在此只用15个字符以内的
        if (text.length > 9 && text.length < 15)
            return true;

        // 4-9 位的，算法决定
        text += '.bit';
        var hash = blake2b(32, null, null, Buffer.from('2021-07-22 12:00'));
        hash = hash.update(Buffer.from(text));
        var output = new Uint8Array(32)
        var out = hash.digest(output);
        console.log(out);
        
        
        let arr = out.slice(0,4);
        let uintValue = this.toBeUint32(arr);

        // 测试0917功能, 之后用 new Date 替换
        //let localTime = new Date('2021-09-17 10:00');
        let localTime = new Date()

        if (uintValue <= this.getCanRegistValue(localTime)) {
        //    console.log(text, arr, uintValue);
            return true;
        }

        return false
    }


    // 校验一个账号是否已开放注册，用于 5- 9 位账号
    // 5-9 位，只开放 5 % 采用 blake2b 算法对账户名(包含 .bit 后缀)进行 hash ，取 hash 结果的第 1 个字节作为一个 u8 整数，当该整数小于等于 12 时，即可注册。
    canRegister = text => {
        // 9/17 时放开
        //return this.canRegister0917(text);


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

        //this.setState({keyword: snsArr});
        this.state.keyword = snsArr ? snsArr : "";
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
            if (item.length > 9)
                continue;
                
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
                    }, 10000);
                })
        });
    }

    onTimeShowNewDASInfo = () => {
        //console.log(newDASBornList);
        console.log(das.registered.length);
        if (newDASBornList.length > 0) {
            let newDAS = newDASBornList.shift();
         
            let nameMD5 = md5(newDAS)
            let id = `img${nameMD5}`
            let dom = <div id={id} style={{width: "32px", height: "32px"}}></div>
            message.success({
                // 考虑换成深色背景，但没调好。
                content: <div style={{display:'flex'}}><div>{dom}</div><div style={{marginLeft:16, verticalAlign: 'middle', height:'100%', display:'flex'}} ><div className='registed-account-name'>{newDAS}</div> <div className='bold_pink'>{this.langConfig('newdas-registed-tip')}</div></div></div>,
                //className: 'css-1tkvan3',
                style: {
                  marginTop: '3vh',
                  
                },
                icon: <div/>})

            setTimeout(() => {
                this.getImg(id, newDAS)
            }, 10)
        }
    }
    
    getMidString = (src, start_str, end_str) => {
        let start = src.indexOf(start_str)
        if ( start >= 0 ) {
            start += start_str.length;
            let end = src.indexOf(end_str)
            if (end >= 0 && end > start) {
                return src.substr(start, end - start);
            }
        }

        return "";
    }
    
    addNewBornDAS = (item, msgTime) => {
        let account = this.getMidString(item, '** ', ' **')
        if (das.registered.indexOf(account) < 0) {
            das.registered.push(account);
            
            let now = new Date();
            let msgTime = new Date(item['timestamp']);
            let timeInterval = now - msgTime;       // 毫秒间隔
            // 5 分钟内注册的，可列入提示列表，至少留一个来提醒
            if (newDASBornList.length === 0 || timeInterval < 5*60*1000)
                newDASBornList.push(account);
        }
        //console.log(account);
    }

    getRegistList = async () => {
        let that = this;
        return new Promise((resolve) => {
            const headers = {
                //'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
                'authorization': 'ODY3ODA0ODU1MjMwMDA1MzA4.YPmcVg.iRQmn4cB0o_T6CRsoI-fymQKER0',
                'cookie': '__dcfduid=4c76a7a70895b91877e29c9534d5fa30; __sdcfduid=b31379a6f3ff11eb96d242010a0a02bc0e534fe0d6b719f4db746cfff96889994a9b543e4bb06bb57942c430e90bd14b'
            }

            let url = 'https://discord.com/api/v9/channels/831429673115451395/messages?limit=100&after=' + das.lastRegiseredId
            fetch(url, { headers })
            .then(function(response){
                return response.json();  
              })
              .then(function(json){
                  json.forEach(item => {
                      // 考虑到一次content里可能会来多笔数据，以\n分割
                      if (item['content'].indexOf('\n') > 0) {
                            let accountList = item['content'].split('\n')
                            for ( let it in accountList) {
                                that.addNewBornDAS(it, item['timestamp']);
                            }
                      }
                      else {
                        that.addNewBornDAS(item['content'], item['timestamp']);
                      }
                  });

                  if (json.length > 0) {
                      das.lastRegiseredId = json[0].id;
                      console.log(das.lastRegiseredId);
                      // 如果有数据，继续拉取
                      setTimeout(() => {
                          that.getRegistList();
                      }, 1000);
                  }
              })
              .catch(function(err){
                console.log(err); 
              });
        });
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
        if (language.indexOf("zh") !== -1) {
            language = "zh_CN";
        } else if (language.indexOf('en') !== -1) {
            language = "en_US";
        } else {
            //其它的都使用英文
            language = "en_US";
        }

        this.changeLanguage(language);

        // 先提前预加载logo。避免使用的时候第一次加载头像失败头像绘制出问题
        const {Sprite} = spritejs;
        const logoSprite = new Sprite(img);

        // 强制执行一次
        this.getRegistList();

        // 再设置定时器，拉取最新注册账号，1分钟跑一次，之后改成 5 分钟 todo
        let timerID1 = setInterval(this.getRegistList, 1 * 60 * 1000);
        

        // 4 秒钟执行一次，查看是否有新注册账号，若有，则提示出来
        let timerID2 = setInterval(this.onTimeShowNewDASInfo, 4 * 1000);
        this.setState({discordTimerId: timerID1, showNewDASTimerID: timerID2});
    }

    componentWillUnmount() {
        // use intervalId from the state to clear the interval
        if (this.state.discordTimerId > 0) {
            clearInterval(this.state.discordTimerId);
        }
        
        clearInterval(this.state.showNewDASTimerID);
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
            let lang = this.state.locale;
            if (this.state.banners[lang][index].link.length > 0)
                window.open(this.state.banners[lang][index].link);
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
                            centerSlidePercentage={50}
                            onClickItem={onClickCarouselItem}
                        >
                            {this.state.banners[this.state.locale].map((value, index) => {
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
                            <TextArea onChange={(e) => this.textAreaChange(e)} allowClear placeholder={this.langConfig('das-description')}
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
                          extra={<Button type="primary" shape="round" danger 
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
