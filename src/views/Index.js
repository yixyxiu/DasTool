import React, { useState, useEffect } from 'react';
import {Card, Space, Input, Button, Table, Alert, Menu, Dropdown, Radio, Divider, message, Tooltip, Tag, Select, Form, notification} from 'antd';
import {SearchOutlined, DownOutlined, QuestionCircleFilled} from '@ant-design/icons';
import { Treemap, Line, WordCloud, Bar } from '@ant-design/charts';
import { Column } from '@ant-design/plots';
import {Carousel} from "react-responsive-carousel";
import {CopyToClipboard} from 'react-copy-to-clipboard';   // copy 地址用到
import https from '../api/https';   // 请求discord用到
import TextArea from 'antd/lib/input/TextArea';
import "react-responsive-carousel/lib/styles/carousel.min.css"
//import { polyfill } from 'spritejs/lib/platform/node-canvas'
import * as spritejs from 'spritejs';   // 头像用到
import md5 from 'blueimp-md5'
import img from "../img/logo.png"
import DAS_LA_LOGO from '../img/dasla_logo.png';
import CKB_QRCODE from '../img/ckb_qrcode.png';
import REG_DENAME_LOGO from '../img/ic-registrar-dename.png';
import REG_DAS_LOGO from '../img/ic-registrar-das.png';
import WORDCLOUD_MASK from '../img/wordcloud_mask.png';
import CERTIFICATE_MASK from '../img/certificate_mask.jpg';
import {FIGURE_PATHS, COLORS, getColors, getPositions, getFigurePaths, DASOPENEPOCH, DONATEADDRESS, TABLEFILTER} from "../mock/constant"
import { indexOf } from '@antv/util';
//import { loadConfig } from 'browserslist';

//const {Footer} = Layout
const { Option } = Select;


var blake2b = require('blake2b');
//const { TextArea } = Input;
let das = require('../mock/registered.json');
das.suffixList = require('../mock/suffix.json');
das.prefixList = require('../mock/prefix.json');
das.reserved = require('../mock/reserved.json');
das.recommendList = require('../mock/recommendList.json');
das.banners = require('../mock/banners.json');
das.linkResources = require('../mock/linkResources.json');
das.ownerStat = require('../mock/accountsOwner.json');
das.recentRegData = [];
das.recentOwnerData = [];

let localeConfig = require('../mock/lang.json');
let iconMap = new Map();
// https://identicons.da.systems/avatar/nervosyixiu.bit?size=xxs
// 存放新注册且没有显示通知的账号列表
let newDASBornList = [];

let defKeywords = ['btc','eth','ckb','bnb','uni','das','nervos','link','ada','dex',
        'swap','defi','nft','gamefi','crypto','token','coin','market','finance','exchange',
        'ex','wallet','fork','hashing','hodl','stake', 'farm','miner','node','block',
        'genesis','hash','fans','bar','moon','trans','boy','girl','poor','rich',
        'gold','game','sky','home','sun','fuck','digital','fund','chain','foundation',
        'air','club','cool','bit','bitcoin','key','vip','super','cloud','open',
        'drop','new','imtoken','stock','good','world','metavers','qq','little','system',
        'bridge','dapp','shop','hot','blue','black','green','base','king','white',
        'dao','satoshi','ethereum','vitalik','0x','ico','comp','currency','hunt',
        'asset','heco','bsc','888','666','000','999','777','222','111',
        'just','lend','mask','okex','sushi','graph','tron','pay','dai','dog',
        'fish','protocol','dot','file','cyber','city','bank','china','net',
        'network','com','cn','chat','ok','hello','work','list','money','love',
        'alibaba','huawei','tencent','baidu','box','lake','man','team','official','hold',
        'gogo','space','social','web','online','play','my','hero','baby','more',
        'developer','war','your','pig','airdrop','yyds','buy','sea','live','maker',
        'broker','right','punk','star','launch','hunter','one','first','last','ens',
        'mini','whale','123','12345','321','luck','lucky','house','allin','trust',
        'google','group','loser','winner','music','video','safe','hand','big','long',
        'labs','apple','web3','polkadot','artist','alpha','book','solana','meta','metaverse',
        'killer','kill'
        ];
let random = Math.floor(Math.random()*defKeywords.length); 

const FIXMETHODS = {
    ASPREFIX: 1,
    ASSUFFIX: 2
}

const DASACCOUNTSTATUS = {
    Available: '0',
    OnSale:'1',
    NotOpen: '2',
    Registered: '3',
    Reserved: '4',
    Registering: '5',
}

// 注意，顺序与上面的DASACCOUNTSTATUS保持一致
/*let AccountStatusColors = [
    Available: '0',
    Reserved: '1',
    Registering: '2',
    Registered: '3',
    NotOpen: '4',

    '#22C493',
    '#808191',
    '#FFD717',
    '#FFA800',
    '#DF4A46',
]*/

let AccountStatusColors = {
    '0':'#1890ff',
    '1':'#1890ff',
    '2':'#DF4A46',
    '3':'#FFA800',
    '4':'#808191',
    '5':'#FFD717',
}
    
let defLocalConfig= {
    "newbie-add-favorite-tip-showed": "false",
    "newbie-remove-favorite-tip-showed": "false",
};


class DaslaFooter extends React.Component {
    state = {copied: false};
    formatCKBAddress = (address) => {
        let begin = address.substr(0,8);
        let end = address.substr(-8);
        let str = begin + '...' + end;

        return str;
    }

    // copy完成之后的处理
    OnCopy = () => {        
        console.log('OnCopy');
        this.setState({copied: true});
        // 只显示3秒钟
        setTimeout(() => {
            this.setState({copied: false});
        }, 3000)
    }

    getCopiedFlagText = () => {
        if (this.state.copied) {
            return <i className="fa fa-check-circle foot-small-icon-flag"></i>;
        }
        
        return ""
    }

    render() {
        
        return <footer className="site-footer"> 
        <div className="footer-inside"> 
         <div className="footer-message-and-form"> 
          <p className="colophon">{this.props.langConfig('about-dasla-1')} <span className='footer-team'>CKBFans</span>{this.props.langConfig('about-dasla-2')}</p> 
          <div className="footer-form-wrap"> 
           <form> 
            <h4>{this.props.langConfig('share-das-tip')}</h4> 
            
            <div className="footer-form"> 
            <ul className="social">
                {this.props.linkResources['social-share'].map((value, index) => {
                    return <li key={index}><a href={value.link} target="_blank" rel="noopener noreferrer"><span className={value.iconClassName}></span></a></li>
                })}
            </ul>
            </div>
           </form> 
          </div> 
         </div> 
         <div className="link-grid"> 
          <div> 
           <div> 
            <h5> {this.props.langConfig('tutorials')} </h5> 
            <ul>
                {this.props.linkResources['tutorials'][this.props.locale].map((value, index) => {
                    return <li key={index}><a href={value.link} target="_blank" rel="noopener noreferrer">{value.name}</a></li>
                })}
            </ul> 
           </div> 
          </div> 
          <div> 
           <div> 
            <h5>{this.props.langConfig('community')}</h5> 
            <ul> 
                {this.props.linkResources['community'][this.props.locale].map((value, index) => {
                    return <li key={index}><a href={value.link} target="_blank" rel="noopener noreferrer">{value.name}</a></li>
                })}
            </ul> 
           </div> 
          </div> 
          
          <div> 
           <div> 
            <h5>{this.props.langConfig('follow-das')}</h5> 
            <ul className="follow-das-social">
                {this.props.linkResources['official'][this.props.locale].map((value, index) => {
                    return <li key={index}><a href={value.link} target="_blank" rel="noopener noreferrer"><span className={value.iconClassName}></span>{value.name}</a></li>
                })}
            </ul>
           </div> 
          </div> 

          <div> 
           <div> 
            <h5>{this.props.langConfig('donate')}</h5> 
            <ul >
                <li><a href="https://cryptofans.bit.cc" target="_blank" rel="noopener noreferrer">cryptofans.bit</a></li>
                <img className="foot-ckbaddr-qr" alt="" src={CKB_QRCODE}/>
	    	    <li><label>{this.formatCKBAddress(DONATEADDRESS)}</label></li>
                <li>
                    <CopyToClipboard onCopy={this.OnCopy} text={DONATEADDRESS} >
                      <span className="foot-copy-address"> {this.props.langConfig('copy-address')} <span className="fa fa-clone"></span> {this.getCopiedFlagText()}</span>
                    </CopyToClipboard>
                    
                </li>
            </ul>
           </div> 
          </div>

         </div> 
         <Divider type="horizontal" className="footer-divider"/>
         <p className="footer-copyright">
            © 2021 DASLA Limited. All rights reserved.
         </p> 
         </div> 
        
       </footer>;
    }
}

class ForSaleAccountCard extends React.Component {
    formatAddress = (address) => {
        if (address.len < 10){
            return address;
        }

        let begin = address.substring(0,6);
        let end = address.substring(address.length-6);
        let str = begin + '...' + end;

        return str;
    }

    state = {
        account: '',
        accountDetail: {}
    }

    componentDidMount() {
        // 获取账号明细
        setTimeout(() => {
            this.loadAccountDetail(this.props.account+'.bit');
        }, 100);
    }

    loadAccountDetail = (account) => {
        let that = this;
        return new Promise((resolve) => {
            const headers = {
                'content-type': 'application/json;charset=UTF-8',
              }

            const data = {"account": account}

            const optionParam = {
                headers: headers,
                body: JSON.stringify(data),
                method: 'POST', 
            }

            let url = 'https://tx-api.bestdas.com/v1/sell/account/detail'

            fetch(url, optionParam)
            .then(function(response){
                return response.json();  
            })
            .then(function(json){                     
                let account_onsale = json['data']
            //    console.log(account_onsale)
                
                if (account_onsale.account === account && account_onsale.status === 1) {
                    that.loadReverseRecord(account_onsale);
                //    console.log('get detail ：' + account_onsale.account);
                    that.setState({
                        account: account_onsale.account,
                        accountDetail: account_onsale
                    })
                }
              })
              .catch(function(err){
                console.log(err);
            /*//  测试接口，因本地localhost 不能访问bestdas
                
                let info = {"account":"defihacker.bit","price_ckb":"88000000000000","price_usd":"17684.392","status":1,"collection_num":0,"owner_chain_type":1,"owner_address":"0x64619F4F65DCB33D15eB5687112718E1ace16f34","description":"DeFi hacker !","timestamp":1634828331870,"expire_at":1660175511000}
                
                that.loadReverseRecord(info);*/
              });
        });
    }

    loadReverseRecord = (accountDetail) => {
        let that = this;
        return new Promise((resolve) => {
            const headers = {
                'content-type': 'application/json;charset=UTF-8',
              }

            const params = [{
                "type":"blockchain",
                "key_info":{
                    "coin_type":"60",   // ToDO
                    "chain_id":accountDetail.owner_chain_type + "",
                    "key":accountDetail.owner_address
                }
            }]

            const payload = {
                "jsonrpc":"2.0",
                "id":"1",
                "method":"das_reverseRecord",
                "params":params
            }
            
            const optionParam = {
                headers: headers,
                body: JSON.stringify(payload),
                method: 'POST', 
            }

            let url = 'https://indexer-basic.da.systems/'

            fetch(url, optionParam)
            .then(function(response){
                return response.json();  
            })
            .then(function(json){                     
                let reverse_data = json['result']['data']
                console.log('reverse_data:' + reverse_data)
                
                if (json['result']['errno'] === 0) {     
                    accountDetail.reverse_record = reverse_data.account   
                    that.setState({
                        account: accountDetail.account,
                        accountDetail: accountDetail
                    })
                }
              })
              .catch(function(err){
                console.log(err);
              });
        });
    }


    // 根据账号长度计算字体大小
    calcAccountNameFontSize = () => {
        let maxFontSize = 64;   // 4 个字符时
        let minFontSize = 24;   // 15 个字符时
        let accountLen = this.props.account.length;
        if (accountLen > 15) {
            return minFontSize;
        }

        if (accountLen < 4) {
            return maxFontSize;
        }
        
        let fontSize = 64 - (64-24)/(15-4)*(accountLen-4)-5.5;
        return fontSize;
    }

    /* 
    "data": {
        "account": "uniquenft.bit",
        "price_ckb": "1500000000000",
        "price_usd": "310.42725",
        "status": 1,
        "collection_num": 0,
        "owner_chain_type": 1,
        "owner_address": "0xeaea3a7ab8762be33d06796aaca691d67d6d17ed",
        "description": "特别的，唯一的NFT",
        "timestamp": 1634829472000,
        "expire_at": 1666322649000
    }
    */
    getAccountDetail = (key) => {
        if (!this.state.accountDetail) {
            return '';
        }

        if (key in this.state.accountDetail) {
            return this.state.accountDetail[key];
        }

        return '';
    }

    // 格式化持有人地址展示
    formatOwnerAddress = () => {
        let address = this.getAccountDetail('owner_address');
        if (address.length < 15) {
            return address;
        }

        return this.formatAddress(address);
    }

    // 格式化地址与DAS反向解析结果的显示
    formatDASReverseRecord = () => {
        let address = this.getAccountDetail('reverse_record');
        if (!address || address.length === 0) {
            return this.formatOwnerAddress();
        }

        if (address.length < 15) {
            return address;
        }

        return this.formatAddress(address);
    }

    formatExpireTime = () => {
        let timestamp = this.getAccountDetail('expire_at');
        let date = new Date(timestamp);

        let strTime = "" + date.getFullYear()+
                    "-"+("0" + (date.getMonth()+1)).slice(-2) +
                    "-"+("0" + (date.getDate())).slice(-2) +
                    " "+("0" + (date.getHours())).slice(-2) +
                    ":"+("0" + (date.getMinutes())).slice(-2) +
                    ":"+("0" + (date.getSeconds())).slice(-2) ;                    
        
        return strTime;
    }

    formatCKBPrice = () => {
        let ckbPrice = this.getAccountDetail('price_ckb');
        if (!ckbPrice) {
            return '0 CKB';
        }

        let realPrice = ckbPrice/100000000;
        let value = "".concat(realPrice).replace(/\d{1,3}(?=(\d{3})+$)/g, function (s) {
                      return "".concat(s, ",");
        });
        
        return value + ' CKB';
    }

    formatAccountDescription = () => {
        let desc = this.getAccountDetail('description');
        if (!desc) {
            desc = '----------'
        }
        return desc;
    }

    viewMarketAccount = () => {
        let url = "https://bestdas.com/account/" + this.state.account + "?inviter=cryptofans.bit&channel=dasdotla.bit";
                                    https://bestdas.com/account/oline.bit?inviter=00711.bit&
        this.props.parent.openLink(url, 'view_market_' + this.state.account);
    }
    
    render() {
        let account = this.props.account + '.bit';
        let nameMD5 = md5(account);
        let id = `market-account${nameMD5}`;
    /*    let dom = <div id={id} style={{width: "32px", height: "32px"}}></div>
        setTimeout(() => {
            this.props.getDASAvata(id, account);
        }, 3000)
    */
    //    let avatar = "https://identicons.da.systems/avatar/" + account + "?size=xxs";
        let avatar = "https://identicons.da.systems/identicon/" + account;
        let dom = <img src={avatar}  style={{height: "32px", width: "32px",borderRadius: "32px"}}></img>;


        return <div className="mini-card">
        <div className="mini-card-owner-row">
            {dom}
            <div className="author-name">{this.formatDASReverseRecord()}</div>
        </div>
        <div className="mini-card-describle-row">
            <div className="fa fa-quote-left fa-card-quote-left"></div>
            <div className="account-describle">{this.formatAccountDescription()}</div>
            <div className="fa fa-quote-right fa-card-quote-right"></div>
        </div>
        
        <div className="golden-das-name-container" style={{backgroundColor:this.props.color}}>
            <div className="golden-das-name" style={{fontSize:this.calcAccountNameFontSize()}}>
            {this.props.account}</div>
            <div className="golden-das-bit-fix">
            .bit</div>
        </div>
        <time>
        <strong>{this.props.langConfig('expire_time')}</strong>
        {this.formatExpireTime()}
        </time>
        <div className="mini-card-price">{this.formatCKBPrice()}
        </div>
        
        <Button className="dasla-btn-select-account" size={'normal'} shape="round"
           onClick={this.viewMarketAccount} >{this.props.langConfig('btn-title-buy-now')}</Button>
                
        
    </div>
    }
}

class DASMarketCardList extends React.Component {

    render() {
        const colors = ['#00E495','brown','dimgrey','chocolate',
                        'blueviolet','darkcyan','darkgoldenrod','coral','none','indianred',
                        'orangered', 'peru'];
        return <div className="popular-das noselect">
            <div className="popular-header header-card">
                <div className="icon-das-for-sale "/>
                <h2 className="header-card-title">{this.props.langConfig('market-card-sponsor-list')}<br /></h2>
                <a href={this.props.langConfig('become-our-sponsor-url')} target="_blank" rel="noopener noreferrer" >{this.props.langConfig('become-a-sponsor')}</a>
            </div>
            <div className="mini-card-grid">
                <ForSaleAccountCard account="enskiller" parent={this.props.parent} getDASAvata={this.props.getDASAvata} langConfig={this.props.langConfig} color={colors[0]} />
                <ForSaleAccountCard account="ponzischeme" parent={this.props.parent} getDASAvata={this.props.getDASAvata} langConfig={this.props.langConfig} color={colors[1]} />
                <ForSaleAccountCard account="adopt" parent={this.props.parent} getDASAvata={this.props.getDASAvata}  langConfig={this.props.langConfig}  color={colors[5]} />                
                <ForSaleAccountCard account="guard" parent={this.props.parent} getDASAvata={this.props.getDASAvata}  langConfig={this.props.langConfig}  color={colors[2]} />
                <ForSaleAccountCard account="labrador" parent={this.props.parent} getDASAvata={this.props.getDASAvata}  langConfig={this.props.langConfig}  color={colors[7]} />
                <ForSaleAccountCard account="victoriafalls" parent={this.props.parent} getDASAvata={this.props.getDASAvata}  langConfig={this.props.langConfig}  color={colors[3]} />
                <ForSaleAccountCard account="defihacker" parent={this.props.parent} getDASAvata={this.props.getDASAvata} langConfig={this.props.langConfig} color={colors[6]} />
                <ForSaleAccountCard account="operahouse" parent={this.props.parent} getDASAvata={this.props.getDASAvata}  langConfig={this.props.langConfig}  color={colors[4]} />
            </div>
        </div>
        
    }
}

class DASPopularCardList extends React.Component {

    render() {
        const colors = ['#00E495','brown','dimgrey','chocolate',
                        'blueviolet','darkcyan','darkgoldenrod','coral','none','indianred',
                        'orangered', 'peru'];
        return <div className="popular-das noselect">
            <div className="popular-header header-card">
                <div className="icon-das-for-sale "/>
                <h2 className="header-card-title">{this.props.langConfig('popular-das-list')}<br /></h2>
            </div>
            <div className="mini-card-grid">
                <ForSaleAccountCard account="delete" parent={this.props.parent} getDASAvata={this.props.getDASAvata} langConfig={this.props.langConfig} color={colors[0]} />
                <ForSaleAccountCard account="qrcode" parent={this.props.parent} getDASAvata={this.props.getDASAvata} langConfig={this.props.langConfig} color={colors[1]} />
                <ForSaleAccountCard account="namecoin" parent={this.props.parent} getDASAvata={this.props.getDASAvata}  langConfig={this.props.langConfig}  color={colors[2]} />                
                <ForSaleAccountCard account="333333" parent={this.props.parent} getDASAvata={this.props.getDASAvata}  langConfig={this.props.langConfig}  color={colors[3]} />
                <ForSaleAccountCard account="0038" parent={this.props.parent} getDASAvata={this.props.getDASAvata}  langConfig={this.props.langConfig}  color={colors[4]} />
                <ForSaleAccountCard account="superx" parent={this.props.parent} getDASAvata={this.props.getDASAvata}  langConfig={this.props.langConfig}  color={colors[5]} />
                <ForSaleAccountCard account="modify" parent={this.props.parent} getDASAvata={this.props.getDASAvata} langConfig={this.props.langConfig} color={colors[6]} />
                <ForSaleAccountCard account="whiteman" parent={this.props.parent} getDASAvata={this.props.getDASAvata}  langConfig={this.props.langConfig}  color={colors[8]} />
                <ForSaleAccountCard account="glorious" parent={this.props.parent} getDASAvata={this.props.getDASAvata}  langConfig={this.props.langConfig}  color={colors[9]} />
            </div>
        </div>
        
    }
}


// 秀一秀
class DASAccountShow extends React.Component {
    
    OnShow = (account) => {

    }

    render() {
        return null
        const onFinish = (values) => {
            console.log('Success:', values);
        };
        
        const onFinishFailed = (errorInfo) => {
            console.log('Failed:', errorInfo);
        };

        return <Card title={this.props.langConfig('das-show')} bordered={false}>
        <Form
            name="basic"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            >
            <Form.Item
                label="Step 1: Enter your .bit Account"
                name="account"
                rules={[{ required: true, message: 'Please input your account' }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="Step 2: Share das.la for Requesting faucet"
                name="sharebtn"
            >
                <a href="https://twitter.com/intent/tweet?url=das.la&text=Requesting faucet prizes for nervosyixiu.bit on das.la, an awesome registration tool of DAS account." target="_blank" rel="noopener noreferrer"><span className="fa fa-twitter"></span></a>
                <Button className="dasla-btn-select-account" size={'normal'} shape="round"
           onClick={this.viewMarketAccount} ><span className="fa fa-twitter"></span></Button>
            </Form.Item>

            <Form.Item
                label="Step 3: Paste the twiter URL"
                name="share_url"
                rules={[{ required: true, message: 'Please input your password!' }]}
            >
                <Input />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                <Button type="primary" htmlType="submit">
                Submit
                </Button>
            </Form.Item>
        </Form>
            <div className="das-certificate-container">
                <img className="das-certificate" src={CERTIFICATE_MASK} alt="das" />
            </div>
        </Card>;
    }
}

class DASInvitRank extends React.Component {

    render() {
        var config = {
            data: this.props.dataCallback(),
            xField: 'count',
            yField: 'name',
            seriesField: 'name',
            legend: { position: 'bottom-left' },
            theme: { "styleSheet": { "brandColor": "#F8D4A4", 
                "paletteQualitative10":['#338CFF','#FFDA23','#C123FF','#FFC12D','#8221FF','#D49742','#FB23FF','#009CFF','#FF5423','#07BF8B','#2336FF','#DE2E8F','#FF2323','#00C8BB','#6500FF','#DE2E62'], 
                "paletteQualitative20":['#338CFF','#FFDA23','#C123FF','#FFC12D','#8221FF','#D49742','#FB23FF','#009CFF','#FF5423','#07BF8B','#2336FF','#DE2E8F','#FF2323','#00C8BB','#6500FF','#DE2E62']}},
            
        };
        return <Bar {...config} />;
    }
}


const DASInvitesLeaderboard = (props) => {
    const [data, setData] = useState([]);
  
    useEffect(() => {
      asyncFetch();
    }, []);
  
    const asyncFetch = () => {
        const headers = {
            'content-type': 'application/json;charset=UTF-8',
          }

        //const data = {"keyword": account,"page":1,"size":50}

        const optionParam = {
            headers: headers,
        //    body: JSON.stringify(data),
            method: 'GET', 
        }

        let url = 'https://api.das.la/api/v1/das_accounts/invites_leaderboard'

        fetch(url, optionParam)
            .then((response) => response.json())
            .then((json) => {
                setData(json)
            })
            .catch((error) => {
            console.log('fetch data failed', error);
            });
    };

    var config = {
        data,
        xField: 'invitee_num',
        yField: 'account',
        seriesField: 'account',
        legend: { position: 'bottom-left' },
        theme: { "styleSheet": { "brandColor": "#F8D4A4", 
            "paletteQualitative10":['#338CFF','#FFDA23','#C123FF','#FFC12D','#8221FF','#D49742','#FB23FF','#009CFF','#FF5423','#07BF8B','#2336FF','#DE2E8F','#FF2323','#00C8BB','#6500FF','#DE2E62'], 
            "paletteQualitative20":['#338CFF','#FFDA23','#C123FF','#FFC12D','#8221FF','#D49742','#FB23FF','#009CFF','#FF5423','#07BF8B','#2336FF','#DE2E8F','#FF2323','#00C8BB','#6500FF','#DE2E62']}},
        
    };

    return <Bar {...config} />;
  };


class DASWordCloud extends React.Component {

    state = {
        wordCloudData:[],
        clientWidth: document.body.clientWidth 
    }

    componentDidMount() {
        console.log('daswordcloud componentDidMount');
        window.addEventListener('resize', this.handleResize.bind(this)) 
    }

    componentWillUnmount() { 
        console.log('daswordcloud componentWillUnmount');
        window.removeEventListener('resize', this.handleResize.bind(this))
    }

    handleResize = () => {
        this.setState({clientWidth: document.body.clientWidth })
    }

    calcFontSize = () => {
        if (this.state.clientWidth < 640) {
            return 48;
        }
        else{
            return 100;
        }
    }
    render() {
        var config = {
            data: this.props.dataCallback(),
            wordField: 'name',
            weightField: 'count',
            padding:[0, -20, 0, -20],
            colorField: 'name',
            height: this.state.clientWidth > 500 ? 500 : this.state.clientWidth,
            
            //with: this.state.clientWidth > 500? 500 : this.state.clientWidth,
            //renderer:'svg',

            imageMask: WORDCLOUD_MASK,
            wordStyle: {
                fontFamily: 'Verdana',
                fontSize: [8, this.calcFontSize()],
            },
            theme: { "styleSheet": { "brandColor": "#F8D4A4", 
                "paletteQualitative10":['#338CFF','#FFDA23','#C123FF','#FFC12D','#8221FF','#D49742','#FB23FF','#009CFF','#FF5423','#07BF8B','#2336FF','#DE2E8F','#FF2323','#00C8BB','#6500FF','#DE2E62'], 
                "paletteQualitative20":['#338CFF','#FFDA23','#C123FF','#FFC12D','#8221FF','#D49742','#FB23FF','#009CFF','#FF5423','#07BF8B','#2336FF','#DE2E8F','#FF2323','#00C8BB','#6500FF','#DE2E62']}},
        };
        //console.log('config.width' + config.width + 'config.height' + config.height)
        return <WordCloud {...config} />;
    };
}

const  DASStatisticSummary = (props) => {
    const [data, setData] = useState({});
  
    useEffect(() => {
      asyncFetch();
    }, {});
  
    const asyncFetch = () => {
        const headers = {
            'content-type': 'application/json;charset=UTF-8',
          }

        const optionParam = {
            headers: headers,
            method: 'GET', 
        }

        let url = 'https://api.das.la/api/v1/das_accounts/sync_total'

        fetch(url, optionParam)
            .then((response) => response.json())
            .then((data) => {
                setData(data)
            })
            .catch((error) => {
            console.log('fetch data failed', error);
            });
    };

    const getDataField = (dataSrc, filed) => {
        if (dataSrc && dataSrc[filed]) {
            return dataSrc[filed];
        }

        return ''
    };

    const getTop1OwnerCount = () => {
        if (data && data['owner_order']) {
            if (data['owner_order'].length > 0) {
                return data['owner_order'][0].total;
            }
        }

        return ''
    }

    const loadDailyStatUpdatedTime = () => {
        let defTitle = props.langConfig('dailystat-title');
        let updateTime = '';
        if (data.update_time) {
            let time = new Date(data.update_time);
            updateTime = time.toLocaleDateString() + " " + time.toLocaleTimeString();
        }
            
        return defTitle + updateTime;
    }

    const getYesterdayRegCount = () => {

        let recentRegData = data.recent_reg_data;// props.recentRegData;
        console.log(recentRegData);
        if (recentRegData && recentRegData.length > 1) {
            return recentRegData[1].count;
        }

        return '';
    }

    const getYesterdayAcountIncrement = () => {

        let recentRegData = data.recent_reg_data;// props.recentRegData;
        if ( recentRegData && recentRegData.length > 1) {
            return recentRegData[1].count - recentRegData[0].count;
        }

        return 0;
    }

    const getYesterdayOwnerCount = () => {
        let recentOwnerData = data.recent_owner_data; //props.recentOwnerData;
        if (recentOwnerData && recentOwnerData.length > 1) {
            return recentOwnerData[1].count;
        }

        return '';
    }

    const getYesterdayOwnerIncrement = () => {
        let recentOwnerData = data.recent_owner_data;//props.recentOwnerData;
        if ( recentOwnerData && recentOwnerData.length > 1) {
            return recentOwnerData[1].count - recentOwnerData[0].count;
        }

        return 0;
    }

    const getCustomDom = (count) => {
        let value = Math.abs(count);
        let up_dom = <div className="statistic-growth_wrapper "><img className="statistic-change-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAhBAMAAADaG82tAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAhUExURUD/vzzHiz7HjD3GizzHij7HjEDOkD3HizzHiz3HizzGilTodQIAAAAKdFJOUwHAd8HPThGs6ppjq8MjAAAAnElEQVQY02NgwAaSUHhsLgXI3BQrc2RJx1WLkaSTpVatEkdIOq9atWohXDoFKLlqFUw3mzGIB9edYgXmQqWBxq5qXrW4CyoNNHYFkOsBlZ68alWL4KrFJqtWLVEAm7vCVXnV4iAPiCybcUuA8qqFASrNEKNTWhmAsgFM7VB7AxhAsgwBcGeCZJG8BJZlGOSyKoImyNxQVaUEBsIAAGaTS7LuoNMXAAAAAElFTkSuQmCC" alt="dasla change up icon"></img><span className="statistic-change-up-value">{value}</span></div>
        let down_dom = <div className="statistic-growth_wrapper"><img className="statistic-change-icon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAeBAMAAAAvN3jVAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAeUExURf9HT/9HT0dwTP9SVP9HT/9GT/9GT/9HUf9HUP9GT+lzoCoAAAAJdFJOU79mAAu81eyFSixCjOgAAACgSURBVBjT1dE/CsIwFMfxDOmQzVS6a3MCQw4QSDu46dJZoR26Cl5AL5DFwu+2zcuzmCuYIfDhC/nDE225DoJ2c9La/tg2otoX3CHWf0XzYr6Z7p55HC3RdFNNbMZAdGq5JuoB0iY+gUkgVjM+D6pnLBfEAeioGg/cEGfEwCcr5CUt3+uzUuRXcU6RmTPF75spU9ym4DluP3JKlkMxfeCRrQ4UXRk5tkeyAAAAAElFTkSuQmCC" alt="dasla change down icon"></img><span className="statistic-change-down-value">{value}</span></div>
        if (count > 0) {
            return up_dom;
        }
        else if (count < 0){
            return down_dom;
        }
        
        return <></>
    }

    return  <div>
                <div className='statistic-data-updatetime'>
                    {loadDailyStatUpdatedTime()}
                </div>
                <br/>
                <div className='statistic-summary-wrapper'>
                    <div className='statistic-info-item'>
                        <div className='statistic-das-count-title'>
                            {props.langConfig('das-registered-count')}
                        </div>
                        <div className='statistic-das-count'>
                            {getDataField(data,'account_num').toLocaleString()}
                        </div>
                    </div>
                    <div className='statistic-info-item'>
                        <div className='statistic-das-count-title'>
                            {props.langConfig('yesterday-registered-count')}
                        </div>
                        <div className='statistic-item-with-growth'>
                            <div className='statistic-das-count'>
                                {getYesterdayRegCount().toLocaleString()}
                            </div>
                            {getCustomDom(getYesterdayAcountIncrement())}
                        </div>
                    </div>
                    <div className='statistic-info-item'>
                        <div className='statistic-das-count-title'>
                            {props.langConfig('das-owner-count')}
                        </div>
                        <div className='statistic-owner-count'>
                            {getDataField(data, 'owner_num').toLocaleString()}
                        </div>
                    </div>
                    <div className='statistic-info-item'>
                        <div className='statistic-das-count-title'>
                            {props.langConfig('yesterday-owner-count')}
                        </div>
                        <div className='statistic-item-with-growth'>
                            <div className='statistic-owner-count'>
                                {getYesterdayOwnerCount().toLocaleString()}
                            </div>
                            {getCustomDom(getYesterdayOwnerIncrement())}
                        </div>
                    </div>
                    <div className='statistic-info-item'>
                        <div className='statistic-das-count-title'>
                            {props.langConfig('max-from-a-unique-owner')}
                        </div>
                        <div className='statistic-owner-count'>
                            {getTop1OwnerCount().toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>
}

const DailyRegCountChart = (props) => {
    const [data, setData] = useState([]);
  
    useEffect(() => {
      asyncFetch();
    }, []);
  
    const asyncFetch = () => {
        const headers = {
            'content-type': 'application/json;charset=UTF-8',
          }

        //const data = {"keyword": account,"page":1,"size":50}

        const optionParam = {
            headers: headers,
        //    body: JSON.stringify(data),
            method: 'GET', 
        }

        let url = 'https://api.das.la/api/v1/das_accounts/daily_reg_count?begin_at=2021-07-20'

        fetch(url, optionParam)
            .then((response) => response.json())
            .then((dailydata) => {
                let totaldata = [];
                let recentData = [];
                let sum = 0;
                for (let index = 0; index < dailydata.length; index++) {
                    let total = {};
                    total["date"] = dailydata[index].date;
                    if (index > 0) {
                        sum = totaldata[index - 1].total;
                    }
                    total["value"] = dailydata[index].total;
                    total["total"] = dailydata[index].total + sum;
                    
                    totaldata.push(total);

                    if (index > dailydata.length - 4) {
                        recentData.push(total);
                    }
                }

                setData(totaldata)
                // 把数据提供给外面
                //props.dataUpdateCallback(recentData);
            })
            .catch((error) => {
            console.log('fetch data failed', error);
            });
    };

    const lineConfig = {
        data,
        renderer:'svg',
        xField: 'date',
        yField: 'total',
        height: 288,
        smooth: "true",
        color: ['#C6304F','#FAA219'],
        theme: { "styleSheet": { "brandColor": "#C6304F", "paletteQualitative10": ["#f94144","#f3722c","#f8961e","#f9844a","#f9c74f","#90be6d","#43aa8b","#4d908e","#577590","#277da1"], "paletteQualitative20":["#f94144","#f3722c","#f8961e","#f9844a","#f9c74f","#90be6d","#43aa8b","#4d908e","#577590","#277da1","#0E4D64"]}},
        lineStyle: {
            fillOpacity: 0.5,
            lineWidth: 2,
        //    stroke: 'C430FF',
        },
       
        yAxis: {
            grid: {
            line: {
                style: {
                lineWidth: 0
                }
            }
            },
            label: {
                formatter: function formatter(v) {
                  let value = ""
                    .concat(v)
                    .replace(/\d{1,3}(?=(\d{3})+$)/g, function (s) {
                      return "".concat(s, ",");
                    });
                  return value;
                }
              }
            }
        };


    const config = {
        data,
        padding: 'auto',
        xField: 'date',
        yField: 'value',
        color: '#C6304F',
        height: 288,
        renderer:'svg',
        xAxis: {
            label: {
                autoRotate: false,
            },
        },
        slider: {
            start: 0.8,
            end: 1.0,
        },
        yAxis: {
            grid: {
                line: {
                    style: {
                    lineWidth: 0
                    }
                }
            },
            label: {
                formatter: function formatter(v) {
                  let value = ""
                    .concat(v)
                    .replace(/\d{1,3}(?=(\d{3})+$)/g, function (s) {
                      return "".concat(s, ",");
                    });
                  return value;
                }
              }
            },
        
        };
    return <div className='statistic-daily-chart'>
                    <div className='statistic-das-count-title'>
                    {props.langConfig('daily-registered-chart-title')} 
                    </div>
                    <div>
                    <Column {...config} /> 
                    
                    </div>
                    <div className='statistic-das-count-title'>
                     {props.langConfig('total-registered-chart-title')} 
                    </div>
                    <div>
                    <Line {...lineConfig} /> 
                    </div>
            </div>;
  };


  const DailyOwnerCountChart = (props) => {
    const [data, setData] = useState([]);
  
    useEffect(() => {
      asyncFetch();
    }, []);
  
    const asyncFetch = () => {
        const headers = {
            'content-type': 'application/json;charset=UTF-8',
          }

        //const data = {"keyword": account,"page":1,"size":50}

        const optionParam = {
            headers: headers,
        //    body: JSON.stringify(data),
            method: 'GET', 
        }

        let url = 'https://api.das.la/api/v1/das_accounts/daily_new_owner?begin_at=2021-07-01'

        fetch(url, optionParam)
            .then((response) => response.json())
            .then((dailydata) => {
                let totaldata = [];
                let recentData = [];
                let sum = 0;
                for (let index = 0; index < dailydata.length; index++) {
                    let total = {};
                    total["date"] = dailydata[index].date;
                    if (index > 0) {
                        sum = totaldata[index - 1].total;
                    }
                    total["value"] = dailydata[index].total;
                    total["total"] = dailydata[index].total + sum;
                    
                    totaldata.push(total);

                    if (index > dailydata.length - 4) {
                        recentData.push(total);
                    }
                }
                setData(totaldata)
                // 把数据提供给外面
                //props.dataUpdateCallback(recentData);
            })
            .catch((error) => {
            console.log('fetch data failed', error);
            });
    };

    const lineConfig = {
        data,
        renderer:'svg',
        xField: 'date',
        yField: 'total',
        height: 288,
    //    seriesField: "category",
        smooth: "true",
        color: ['#7B48F6','#FAA219'],
        theme: { "styleSheet": { "brandColor": "#7B48F6", "paletteQualitative10": ["#f94144","#f3722c","#f8961e","#f9844a","#f9c74f","#90be6d","#43aa8b","#4d908e","#577590","#277da1"], "paletteQualitative20":["#f94144","#f3722c","#f8961e","#f9844a","#f9c74f","#90be6d","#43aa8b","#4d908e","#577590","#277da1","#0E4D64"]}},
        lineStyle: {
            fillOpacity: 0.5,
            lineWidth: 2,
            color: 'C430FF',
        },
        yAxis: {
            grid: {
            line: {
                style: {
                lineWidth: 0
                }
            }
            },
            label: {
                formatter: function formatter(v) {
                  let value = ""
                    .concat(v)
                    .replace(/\d{1,3}(?=(\d{3})+$)/g, function (s) {
                      return "".concat(s, ",");
                    });
                  return value;
                }
              }
            }
        };

    const config = {
        data,
        padding: 'auto',
        xField: 'date',
        yField: 'value',
        color: ['#7B48F6','#FAA219'],
        theme: { "styleSheet": { "brandColor": "#7B48F6", "paletteQualitative10": ["#f94144","#f3722c","#f8961e","#f9844a","#f9c74f","#90be6d","#43aa8b","#4d908e","#577590","#277da1"], "paletteQualitative20":["#f94144","#f3722c","#f8961e","#f9844a","#f9c74f","#90be6d","#43aa8b","#4d908e","#577590","#277da1","#0E4D64"]}}, 
        height: 288,
        renderer:'svg',
        xAxis: {
            label: {
                autoRotate: false,
            },
        },
        slider: {
            start: 0.8,
            end: 1.0,
        },
        yAxis: {
            grid: {
                line: {
                    style: {
                    lineWidth: 0
                    }
                }
            },
            label: {
                formatter: function formatter(v) {
                  let value = ""
                    .concat(v)
                    .replace(/\d{1,3}(?=(\d{3})+$)/g, function (s) {
                      return "".concat(s, ",");
                    });
                  return value;
                }
              }
            },
        
        };

    return  <div className='statistic-daily-chart'>
                <div className='statistic-das-count-title'>
                    {props.langConfig('daily-new-owners-count-chart-title')} 
                </div>
                <div>
                    <Column {...config} /> 
                </div>
                <div className='statistic-das-count-title'>
                    {props.langConfig('das-owners-count-chart-title')} 
                </div>
                <div>
                    <Line {...lineConfig} /> 
               </div>
            </div>;
  };

class DASUniqueOwnerLine extends React.Component {
    state = {
        daily_data : []
    }
    
    loadData = () => {
        let dailydata = this.props.dataCallback();
        let totaldata = [];
        let sum = 0;
        for (let index = 0; index < dailydata.length; index++) {
            dailydata[index].category = "daily"
            let total = {};
            total["date"] = dailydata[index].date;
            if (index > 0) {
                sum = totaldata[index - 1].value;
            }
            total["value"] = dailydata[index].value + sum;
            total["category"] = "sum";
            totaldata.push(total);
        }

        let showdata = dailydata.concat(totaldata);

        return totaldata;
    }

    render() {
        let config = {
        data: this.loadData(),
        renderer:'svg',
        padding:[10, 8, 32, 48],
        xField: "date",
        yField: "value",
        height: 288,
    //    seriesField: "category",
        smooth: "true",
        color: ['#7B48F6','#FAA219'],
        theme: { "styleSheet": { "brandColor": "#7B48F6", "paletteQualitative10": ["#f94144","#f3722c","#f8961e","#f9844a","#f9c74f","#90be6d","#43aa8b","#4d908e","#577590","#277da1"], "paletteQualitative20":["#f94144","#f3722c","#f8961e","#f9844a","#f9c74f","#90be6d","#43aa8b","#4d908e","#577590","#277da1","#0E4D64"]}},
        lineStyle: {
            fillOpacity: 0.5,
            lineWidth: 4
        },
        yAxis: {
            grid: {
            line: {
                style: {
                lineWidth: 0
                }
            }
            },
            label: {
                formatter: function formatter(v) {
                  let value = ""
                    .concat(v)
                    .replace(/\d{1,3}(?=(\d{3})+$)/g, function (s) {
                      return "".concat(s, ",");
                    });
                  return value;
                }
              }
            }
        };
        
        return <Line {...config} />;
    }
  };

class DASLine extends React.Component {
    state = {
        daily_data : []
    }
    
    loadData = () => {
        let dailydata = this.props.dataCallback();
        let totaldata = [];
        let sum = 0;
        for (let index = 0; index < dailydata.length; index++) {
            dailydata[index].category = "daily"
            let total = {};
            total["date"] = dailydata[index].date;
            if (index > 0) {
                sum = totaldata[index - 1].value;
            }
            total["value"] = dailydata[index].value + sum;
            total["category"] = "sum";
            totaldata.push(total);
        }

        let showdata = dailydata.concat(totaldata);

        return totaldata;
    }

    render() {
        let config = {
        data: this.loadData(),
        renderer:'svg',
        padding:[10, 8, 32, 48],
        xField: "date",
        yField: "value",
        height: 288,
    //    seriesField: "category",
        smooth: "true",
    //    color: ['#7B49F6', '#C7304F', '#FAA219'],
        color: ['#C7304F','#FAA219'],
        theme: { "styleSheet": { "brandColor": "#C7304F", "paletteQualitative10": ["#f94144","#f3722c","#f8961e","#f9844a","#f9c74f","#90be6d","#43aa8b","#4d908e","#577590","#277da1"], "paletteQualitative20":["#f94144","#f3722c","#f8961e","#f9844a","#f9c74f","#90be6d","#43aa8b","#4d908e","#577590","#277da1","#0E4D64"]}},
        lineStyle: {
            fillOpacity: 0.5,
        //    stroke: "#C7304F",
            lineWidth: 4
        },
    /*    lineStyle: {
            fillOpacity: 0.5,
        //    stroke: "#C7304F",
            lineWidth: 3,
        //    strokeOpacity: 0.7,
        //    shadowColor: "yellow",
            shadowBlur: 10,
            shadowOffsetX: 3,
            shadowOffsetY: 0
        },*/
    /*    lineStyle: {
            fillOpacity: 0.5,
            stroke: "#C7304F",
            lineWidth: 3,
            strokeOpacity: 0.7,
            shadowColor: "black",
            shadowBlur: 10,
            shadowOffsetX: 3,
            shadowOffsetY: 0
        },*/
        yAxis: {
            grid: {
            line: {
                style: {
                lineWidth: 0
                }
            }
            },
            label: {
                formatter: function formatter(v) {
                  let value = ""
                    .concat(v)
                    .replace(/\d{1,3}(?=(\d{3})+$)/g, function (s) {
                      return "".concat(s, ",");
                    });
                  return value;
                }
              }
            }
        
    /*    annotations: [
            {
            type: "line",
            start: ["min", "median"],
            end: ["max", "median"],
            style: {
                stroke: "#F4664A",
                lineDash: [4, 4]
            }
            }
        ]*/
        };

        
        return <Line {...config} />;
    }
  };

class DASTreemap extends React.Component {
    
    langConfig = (key) => {
        return this.props.loadConfigCallback(key)
    }

    render() {
        let data = {
            name: 'root',
            children: this.props.dataCallback()
        }
        var config = {
            data: data,
            colorField: 'name',
            fontFamily: 'Verdana',
            renderer:'svg',
            padding:[8, 0, 24, 0],
            interactions: [{ type: 'legend-filter', enable: true }],
            label: {
            formatter: (datum) => {
                return datum.name + this.langConfig('letters') + '\n'+ datum.value ;
            },
          /*  style: (datum) => {
                return {fontSize: datum/17000*100*14}
            },*/
            style:{
                opacity: 0.6,
                fontSize: 16,
                
            },
            rotate: false
            },
            tooltip: {
            formatter: (datum: Datum) => {
                return { name: datum.name + this.langConfig('letters'), value: datum.value};
            },
            style: {
                opacity: 0.6,
                fontSize: 24
            }
            },
            
            theme: { "styleSheet": { "brandColor": "#F8D4A4", 
                "paletteQualitative10":['#338CFF','#FFDA23','#C123FF','#FFC12D','#8221FF','#D49742','#FB23FF','#009CFF','#FF5423','#07BF8B','#2336FF','#DE2E8F','#FF2323','#00C8BB','#6500FF','#DE2E62'], 
                "paletteQualitative20":['#338CFF','#FFDA23','#C123FF','#FFC12D','#8221FF','#D49742','#FB23FF','#009CFF','#FF5423','#07BF8B','#2336FF','#DE2E8F','#FF2323','#00C8BB','#6500FF','#DE2E62']}},
            };
        return <Treemap {...config} />;
    }
};

class DASDailyStat extends React.Component {

    componentDidMount() {
        console.log('DASDailyStat componentDidMount');

    }

    render() {
        return 
    }
}


export default class Index extends React.Component {
    
    cacheData = {
        // 用于判断当前显示尺寸，动态调整一些显示元素。主要是table里面，小尺寸时不显示头像，曾经使用过css的display：none来控制，但还是会有column。
        clientWidth: document.body.clientWidth,
        discordTimerId: 0,
        showNewDASTimerID: 0, 
        DASMarketData:{},       // 正在出售的账号列表
    }

    setCache = (dataObject) => {
        for (let key of Object.keys(dataObject)) {
            this.cacheData[key] = dataObject[key];
        }

        console.log(this.cacheData);
    }

    state = {
        snsArr: [],
        keyword: defKeywords[random],
        locale: 'zh_CN',
        mainTableDataList: [],  // 主表里全量数据
        list: [],  // 主表里显示的数据，也即增加过滤条件后显示的数据
        recommendList: [],
        banners: das.banners,
        favoriteList: [],
        localConfig: defLocalConfig,
        keywordList: [],
        fix: FIXMETHODS.ASPREFIX,
        animationClass: 'dasAnimation',
        mainTableFilter: '-1',  // 显示全部

        loginTime: new Date(),
        dataUpdateFlag: false,
        focusItem: '',
        isNarrowScreen: document.body.clientWidth < 640,
        columns: [
            {
                dataIndex: 'avatar',
                key: 'name',
            //    className:'das-table-avatar',
                width: 50,
                
                render: (text, record, index) => {
                    if (false) {
                        let dom = iconMap.get(record.name);
                        console.log(dom)
                        return dom
                    }
                    else {
                        //console.log('avatar drawing')
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
                    console.log('record add:' + record.name)
                    if (this.state.focusItem === record.name) {
                        return <div className="dasla-register-container">
                            
                            <div className="dasla-btn-register-wraper">
                            <Tooltip placement="topRight" title={this.langConfig('registry-dename-supprts')}>
                                <Button className="dasla-btn-register-account" size={'normal'} shape="round"
                                onClick={() => this.goDeNameRegister(record)}>{this.langConfig('goto-register-btn')}</Button>
                                <img src={REG_DENAME_LOGO}  alt="" className="image-5"/>
                            </Tooltip>
                            
                            </div>
                            <div className="dasla-btn-register-wraper">
                            <Tooltip placement="topRight" title={this.langConfig('registry-das-supprts')}>
                                <Button className="dasla-btn-register-account" size={'normal'} shape="round"
                                    onClick={() => this.goDASRegister(record)}>{this.langConfig('goto-register-btn')}</Button>
                                <img src={REG_DAS_LOGO}  alt="" className="image-5"/>
                            </Tooltip>
                            </div>
                            </div>
                    
                    }
                    else {
                        return <Space size="small">
                        <Button className="dasla-btn-select-account" size={'normal'} shape="round"
                                onClick={() => this.select(record)}>{this.langConfig('register-btn')}</Button>
                    
                        </Space>
                    }
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
                if (item.length < 4) {
                    continue;
                }
                
                // 注意，下面的status附值顺序不能乱动
                let accountStatus = DASACCOUNTSTATUS.NotOpen;
                let account = item + '.bit';
                if (this.canRegister(item)) {
                    accountStatus = DASACCOUNTSTATUS.Available;                  
                }

                if (reserved.includes(account)) {
                    accountStatus = DASACCOUNTSTATUS.Reserved;
                }

                let price = undefined;
                if (registered.includes(account)) {
                    accountStatus = DASACCOUNTSTATUS.Registered;

                    // 如果上次查过在市场上挂单，则修改状态
                    if (account in this.cacheData.DASMarketData) {
                        // TODO， 是否需要加一个过期时间？用户一直不关闭浏览器或者不刷新浏览器，旧数据就一直在，再议。。
                        accountStatus = DASACCOUNTSTATUS.OnSale;
                        price = this.cacheData.DASMarketData[account].price_ckb/100000000;
                    }
                    else {
                        this.searchAccountFromMarket(account);
                    }                    
                }    

                // 添加到结果中
                if (!arr.includes(account)) {
                    arr.push(account);
                    result.push({
                        id: result.length + 1,
                        status: [accountStatus],
                        name: account,
                        price: price
                    })
                }
            }
        }

    //    
    //    if (result.length === 0) {
    //        this.refreshRecommendList();
    //    }
        //Todo，根据用户当前选择的过滤条件，筛选出符合过滤条件的数据
        // 按字符长度排序
        if (result.length > 1) {
            result.sort((a, b) => {
                return (a.status[0]-b.status[0] || (a.name.length - b.name.length))
             });
        }
        let filterList = this.getAccountListByFilter(result, this.state.mainTableFilter)

        //console.log(result)
        this.setState({
            list: filterList,
            mainTableDataList: result
        });
    }

    getAccountListByFilter = (dataSrcList, accountStatus) => {
        console.log('getAccountListByFilter, accountStatus:' + accountStatus);
        if (accountStatus === "-1") {
            //console.log(JSON.stringify(dataSrcList));
            return dataSrcList;
        }
        
        let result = [];
        for ( let i in dataSrcList) {
            let account = dataSrcList[i];
            //console.log('getAccountListByFilter' ,accountStatus,account)
            if (account.status[0] === accountStatus) {
                result.push(account);
            }
        }

        // 按字符长度排序
        if (result.length > 1) {
            result.sort((a, b) => {
                return (a.name.length - b.name.length)
             });
        }

        return result;
    }

    // 数组转化成uint32
    toBeUint32 = (byteArray) => {
        if (!byteArray)
            return 0;
            
        let value = 0;
    //    for (var i = 0; i < byteArray.length; i++) {
    //        value = (value << 8) | byteArray[i];
    //    }
      /*  for (var i = byteArray.length - 1; i >= 0; i--) {
            value = (value * 256) + byteArray[i];
        }*/
    
        for (var i = 0; i < byteArray.length; i++) {
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

    canRegister0917New = account => {
        if (account.length < 4)
            return false;

        // 虽然 > 10 < 47 位都可以注册，但考虑到太长的账号没意义，在此只用15个字符以内的
        if (account.length > 9 && account.length < 20)
            return true;

        // 4-9 位的，算法决定
        account += '.bit';
        let buf = Buffer.from(account)
        let personal = Buffer.from('2021-07-22 12:00')
        let hasher = blake2b(32, null, null, personal)
        hasher.update(buf)
        var output = new Uint8Array(32)
        let hash = hasher.digest(output)
        
        let first4Bytes = Buffer.from(hash.slice(0, 4))
        let lucky_num = first4Bytes.readUInt32BE(0)

        //let dst_num = this.getCanRegistValue(new Date());
        //console.log('new: ' + lucky_num, 'dst:' + dst_num);
        return (lucky_num <= this.getCanRegistValue(new Date()));
        
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
        if (text.length > 9 && text.length < 20)
            return true;

        // 4-9 位的，算法决定
        text += '.bit';
        var hash = blake2b(32, null, null, Buffer.from('2021-07-22 12:00'));
        hash = hash.update(Buffer.from(text));
        var output = new Uint8Array(32)
        var out = hash.digest(output);
        //console.log(out);
        
        
        let arr = out.slice(0,4);
        let uintValue = this.toBeUint32(arr);

        // 测试0917功能, 之后用 new Date 替换
        //let localTime = new Date('2021-09-17 10:00');
        let localTime = new Date()
        // console.log('old: ' + uintValue);
        if (uintValue <= this.getCanRegistValue(localTime)) {
        //    console.log(text, arr, uintValue);
            return true;
        }

        return false
    }

    // 检测是否可以注册
    canRegister = text => {
        // 0917 之后，规则放开
        return this.canRegister0917(text);
    }

    // 获取min 到 max 之间的随机数，包含min，不含 max
    getRandomInt = (min, max) => {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //不含最大值，含最小值
    }

    openLink = (url, windowName) => {
        if (this.state.isNarrowScreen) {
            document.location.href = url;
            document.location.rel = "noopener noreferrer";
        }
        else {
            window.open(url, windowName ? windowName :"newW");
        }
    }
    select = record => {
        // window.open("https://app.da.systems/account/register/" + record.name + "?inviter=cryptofans.bit&channel=cryptofans.bit", "newW")
        let status = record.status[0];
        if (status === DASACCOUNTSTATUS.Registered) {
            if (-1 != indexOf(record.status, DASACCOUNTSTATUS.OnSale)) {
                status = DASACCOUNTSTATUS.OnSale;
            }
        }
                        
        // 如果是窄屏幕（手机），则在本页打开，否则新开窗口。
        let url = "";
        switch (status) {
            case DASACCOUNTSTATUS.Registered: 
            //    url = "https://" + record.name + this.langConfig("dascc-host");
            //    this.openLink(url, 'view_host_'+record.name);
                url = "https://bestdas.com/account/" + record.name + "?inviter=cryptofans.bit";
                this.openLink(url, 'make_offer_'+record.name);
                break;
            case DASACCOUNTSTATUS.OnSale: 
                url = "https://bestdas.com/account/" + record.name + "?inviter=cryptofans.bit";
                this.openLink(url, 'view_market_'+record.name);
                break;
            case DASACCOUNTSTATUS.Reserved: 
                this.openLink(this.langConfig("das-claim-link"));
                break;
            case DASACCOUNTSTATUS.Registering: 
                url = "https://app.da.systems/explorer/account/" + record.name;
                this.openLink(url);
                break;
            case DASACCOUNTSTATUS.NotOpen: 
                this.openLink(this.langConfig("das-limit-link"));
                break;
            default:
                break; 
        }
        
        this.setState({focusItem: record.name})
    }

    getDASRegisterLink = (account) => {
        return "https://app.gogodas.com/account/register/" + account + "?inviter=cryptofans.bit&channel=cryptofans.bit"
//        return "https://app.da.systems/account/register/" + account + "?inviter=cryptofans.bit&channel=cryptofans.bit"
    }

    getDeNameRegisterLink = (account) => {
        return "https://app.dename.com/register/" + account + "?inviter=D2APRJ"
    }

    goDASRegister = record => {
        let url = this.getDASRegisterLink(record.name);
        this.openLink(url, "DasReg" + record.name);  
    }

    goDeNameRegister = record => {
        let url = this.getDeNameRegisterLink(record.name);
        this.openLink(url, "DenameReg" + record.name);
    }

    keywordChanged = e => {
        let snsArr = e.target.value

        snsArr = snsArr.replace(/\s/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        console.log(snsArr)

        //this.setState({keyword: snsArr});
        this.state.keyword = snsArr ? snsArr : "";
    }

    mixWithSuffix = (keyword) => {
        let reserved = das.reserved;
        let registered = das.registered;
        let result = [];
        for (let i = 0; i < das.suffixList.length; i++) {
            let accountName = keyword + das.suffixList[i];
            // 只在结果集里显示 10 位以下的可注册账号
            if (this.canRegister(accountName) && accountName.length < 15) {
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

        if (result.length > 1) {
            result.sort((a, b) => {
                return (a.name.length - b.name.length)
             });
        }

        //console.log(result)
        this.setState({
            keywordList: result
        });
    }

    mixWithPrefix = (keyword) => {
        let reserved = das.reserved;
        let registered = das.registered;
        let result = [];

        for (let i = 0; i < das.prefixList.length; i++) {
            let accountName = das.prefixList[i] + keyword;
            // 只在结果集里显示 10 位以下的可注册账号
            if (this.canRegister(accountName) && accountName.length < 15) {
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

        if (result.length > 1) {
            result.sort((a, b) => {
                return (a.name.length - b.name.length)
             });
        }

        //console.log(result)
        this.setState({
            keywordList: result
        });
    }

    GenerateRecommendList = () => {
        let wordCloud = [{"name":"coin","count":1253},{"name":"bit","count":1139},{"name":"meta","count":1070},{"name":"crypto","count":819},{"name":"ok","count":718},{"name":"bitcoin","count":577},{"name":"888","count":572},{"name":"ex","count":553},{"name":"btc","count":553},{"name":"nft","count":503},{"name":"das","count":456},{"name":"eth","count":439},{"name":"chain","count":333},{"name":"bank","count":320},{"name":"net","count":315},{"name":"uni","count":308},{"name":"pay","count":308},{"name":"love","count":293},{"name":"wallet","count":292},{"name":"token","count":281},{"name":"swap","count":278},{"name":"china","count":278},{"name":"metavers","count":274},{"name":"game","count":274},{"name":"ens","count":273},{"name":"my","count":264},{"name":"com","count":262},{"name":"man","count":261},{"name":"dao","count":258},{"name":"block","count":251},{"name":"ckb","count":233},{"name":"dog","count":230},{"name":"work","count":224},{"name":"world","count":208},{"name":"0x","count":204},{"name":"club","count":187},{"name":"king","count":186},{"name":"network","count":177},{"name":"punk","count":176},{"name":"star","count":172},{"name":"labs","count":172},{"name":"defi","count":162},{"name":"new","count":158},{"name":"moon","count":150},{"name":"air","count":148},{"name":"nervos","count":141},{"name":"sun","count":138},{"name":"first","count":138},{"name":"super","count":132},{"name":"vip","count":128},{"name":"team","count":127},{"name":"fund","count":120},{"name":"launch","count":115},{"name":"digital","count":109},{"name":"ico","count":105},{"name":"cn","count":103},{"name":"long","count":102},{"name":"group","count":101},{"name":"market","count":98}];
        let reserved = das.reserved;
        let registered = das.registered;
        let RecommendList = [];
        
        wordCloud.forEach((item) => {
            // 后缀方式
            for (let i = 0; i < das.prefixList.length; i++) {
                let accountName = das.prefixList[i] + item['name'];
                // 只在结果集里显示 10 位以下的可注册账号
                if (this.canRegister(accountName) && accountName.length < 11) {
                    let account = accountName + '.bit';
                    // 排除
                    if (!reserved.includes(account) && !registered.includes(account)) {
                        RecommendList.push(account);
                    }
                }
            }
            //前缀方式
            for (let i = 0; i < das.suffixList.length; i++) {
                let accountName = item['name'] + das.suffixList[i];
                // 只在结果集里显示 10 位以下的可注册账号
                if (this.canRegister(accountName) && accountName.length < 11) {
                    let account = accountName + '.bit';
                    // 排除
                    if (!reserved.includes(account) && !registered.includes(account)) {
                        RecommendList.push(account);
                    }
                }
            }
        });

        console.log(RecommendList);
    }

    keywordSearch = () => {
        let keyword = this.state.keyword;

        keyword = keyword.replace(/\s/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

    /*    if (!keyword) {
            return this.GenerateRecommendList();
        }*/

        switch (this.state.fix){
            case FIXMETHODS.ASPREFIX:
                this.mixWithSuffix(keyword);
                break;
            case FIXMETHODS.ASSUFFIX:
                this.mixWithPrefix(keyword);
                break;
            default:
                this.mixWithSuffix(keyword);
                break;
        }
        
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
            let tipsInfo = newDASBornList.shift();
            let newDAS = tipsInfo['account'];
            let msgTime = tipsInfo['msgTime'];
         
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

            // 浏览器缓存里保存显示过的提醒
            localStorage.setItem('das-born-showed', msgTime);
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

	// 收到新的注册成功通知之后，更新排行榜
    addOneAccourdToInvitRank = (inviter) => {
        // 出于效率考虑，只对前30 名进行更新处理
        for (let i = 0,j = 0; i < das['invitRank'].length && j < 30; i++, j++) {
            let inviterObj = das['invitRank'][i];
            if (inviterObj['name'] === inviter) {
                das['invitRank'][i]['count'] += 1;
                break;
            }
        }
    }

    // 收到新的注册成功通知之后，更新每日注册数据
    addOneAccourdToDailyData = (date) => {
        let find = false;
        // 出于效率考虑，从后往前处理
        let dailyObj = {}
        for (let i = das['dailyRegistered'].length-1; i > 0; i--) {
            dailyObj = das['dailyRegistered'][i];
            if (dailyObj['date'] === date) {
                das['dailyRegistered'][i]['value'] += 1;
                find = true;
                break;
            }
        }

        if (!find) {
            dailyObj = {'date': date, 'value': 1};
            das['dailyRegistered'].push(dailyObj);
        }
    }

    // '** vivov.bit ** registed for 1 year(s), invited by cryptofans.bit'
    getInviterName = (src_str) => {
        let spliter = 'invited by ';
        let pos = src_str.indexOf(spliter);
        if (pos < 0)
            return ''

        let inviter = src_str.substr(pos + spliter.length);
        
        return inviter;
    }

    addNewBornDAS = (item, msgTime) => {
        //console.log(item, msgTime)
        let account = this.getMidString(item, '** ', ' **');
        let inviter = this.getInviterName(item);
        if (das.registered.indexOf(account) < 0) {
            das.registered.push(account);
            
            // 更新当天的注册数据
            let date = msgTime.substr(0,10);
	        this.addOneAccourdToDailyData(date);
            // 更新词云图

            // 更新邀请榜单
            this.addOneAccourdToInvitRank(inviter)
            
            // 只显示新增的，上次本地已经显示过了，就不再显示
            let lastNewDASTipsTime = localStorage.getItem('das-born-showed')
            if (lastNewDASTipsTime) {
                let thisDateTime = new Date(msgTime);
                if (thisDateTime > new Date(lastNewDASTipsTime)) {
                    let tipsInfo = {};
                    tipsInfo['msgTime'] = msgTime;
                    tipsInfo['account'] = account;
                    newDASBornList.push(tipsInfo);
                }
            }
            else {
                let tipsInfo = {};
                tipsInfo['msgTime'] = msgTime;
                tipsInfo['account'] = account;
                newDASBornList.push(tipsInfo);
            }   
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
                  // 先排序，顺序，时间最小的在最前面
                  json.reverse();
                  json.forEach(item => {
                      //console.log(item)
                      // 考虑到一次content里可能会来多笔数据，以\n分割
                      if (item['content'].indexOf('\n') > 0) {
                            let accountList = item['content'].split('\n')
                            //console.log(accountList)
                            for ( let it in accountList) {
                                that.addNewBornDAS(accountList[it], item['timestamp']);
                            }
                      }
                      else {
                        that.addNewBornDAS(item['content'], item['timestamp']);
                      }
                  });

                  if (json.length > 0) {
                      das.lastRegiseredId = json[json.length-1].id;
                      das.lastUpdateTime = json[json.length-1].timestamp;
                      //that.setState({dataUpdateFlag: true});
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

    // 查询账号是否在市场挂单
    searchAccountFromMarket = async (account) => {
        let that = this;
        return new Promise((resolve) => {
            const headers = {
                'content-type': 'application/json;charset=UTF-8',
              }

            const data = {"keyword": account,"page":1,"size":50}

            const optionParam = {
                headers: headers,
                body: JSON.stringify(data),
                method: 'POST', 
            }

            let url = 'https://tx-api.bestdas.com/v1/sell/account/search'

            fetch(url, optionParam)
            .then(function(response){
                return response.json();  
              })
              .then(function(json){
                  console.log(json)
                  
                  for (let i = 0; i < json['data']['list'].length; i++) {
                    let account_onsale = json['data']['list'][i]
                    console.log(account_onsale)
                    // 增加一个数据来缓存，之后方便显示价格
                    that.cacheData.DASMarketData[account_onsale.account] = account_onsale;
                    if (account_onsale.account === account && account_onsale.status === 1) {
                        console.log('add ' + account_onsale.account);
                        that.addMainTableOnSaleAccount(account_onsale);
                    }
                  }
              })
              .catch(function(err){
                console.log(err);
              });
        });
    }

    addMainTableOnSaleAccount = (accountDetail) => {
    //    console.log(JSON.stringify(accountDetail));
        if (!accountDetail || !accountDetail.account)   {
            return;
        }

    /*    
        for (let index = 0; index < this.state.mainTableDataList.length; ) {
            if (this.state.mainTableDataList[index].name === accountDetail.account) {
                let account_info = this.state.mainTableDataList[index];
                account_info.status.push(DASACCOUNTSTATUS.OnSale);
                this.state.mainTableDataList[index] = account_info;
            //    console.log(JSON.stringify(this.state.mainTableDataList));
                break;
            }
            index++
        }
    */
        // 直接替换状态，原来的已注册状态变为出售状态
        for (let index = 0; index < this.state.mainTableDataList.length; index++) {
            if (this.state.mainTableDataList[index].name === accountDetail.account) {
                this.state.mainTableDataList[index].status = [DASACCOUNTSTATUS.OnSale];
                this.state.mainTableDataList[index].price = accountDetail.price_ckb/100000000;

                // 排序
                if (this.state.mainTableDataList.length > 1) {
                    this.state.mainTableDataList.sort((a, b) => {
                        return (a.status[0]-b.status[0] || (a.name.length - b.name.length))
                     });
                }

                let filterList = this.getAccountListByFilter(this.state.mainTableDataList, this.state.mainTableFilter)
                //console.log(JSON.stringify(filterList));
                // 设置数据
                this.setState({
                    list: filterList,
                    mainTableFilter: this.state.mainTableFilter,
                });

                break;
            }
        }
    }

    changeLanguage = (language) => {
        //把用户的语言写入缓存，供下次获取使用
        localStorage.setItem('locale', language)

        this.setState({locale: language});

        console.log(this.state.locale);
    }

    onFixGroupChange = e => {
        console.log('radio checked', e.target.value);
        this.state.fix = e.target.value;
    };

    loadFavoriteList = () => {
        let favoriteList = localStorage.getItem('favoriteList');
        if (!favoriteList) {
            favoriteList = '[]';
        }
           
        return JSON.parse(favoriteList);
    }

    addToFavorite = (account) => {
        if (!this.state.favoriteList.includes(account)) {
            console.log(this.state.favoriteList)
            console.log(account);
            this.state.favoriteList.push(account);

            this.saveFavoriteList(this.state.favoriteList);

            // 没有提示过，则提醒用户，本地收藏是安全的
            if (!this.state.localConfig['newbie-add-favorite-tip-showed']) {
                this.openNotification(
                    'success',
                    this.langConfig('add-to-favorite'), 
                    this.langConfig('first-add-fav-tip'),
                    0)

                this.state.localConfig['newbie-add-favorite-tip-showed'] = true;
                this.saveLocalConfig(this.state.localConfig);
            }
        }
    }

    removeFromArray = (arr, value) => { 
    
        return arr.filter(function(ele){ 
            return ele != value; 
        });
    }

    removeFromFavorite = (account) => {
        this.state.favoriteList = this.removeFromArray(this.state.favoriteList, account);
        this.saveFavoriteList(this.state.favoriteList);

        // 没有提示过，则提醒用户，本地收藏是安全的
        if (!this.state.localConfig['newbie-remove-favorite-tip-showed']) {
            this.openNotification(
                'warning',
                this.langConfig('remove-from-favorite'), 
                this.langConfig('remove-from-favorite-tip'),
                0)

            this.state.localConfig['newbie-remove-favorite-tip-showed'] = true;
            this.saveLocalConfig(this.state.localConfig);
        }
    }

    clearFavorite = () => {
        this.setState({favoriteList: []});
        this.saveFavoriteList([]);
    }

    saveFavoriteList = (favoriteList) => {
        if (favoriteList) {
            localStorage.setItem('favoriteList', JSON.stringify(favoriteList));
        }

        this.setState({favoriteList: favoriteList});
    }

    getUnFavoriteTip = (account) => {
        let format = this.langConfig('unfavorite-item-tip');
        return format;
    }

    loadLocalConfig = () => {
        let config = localStorage.getItem('localConfig');
        if (!config) {
            config = '{}';
        }
           
        return JSON.parse(config);
    }

    saveLocalConfig = (config) => {
        if (config) {
            localStorage.setItem('localConfig', JSON.stringify(config));
        }
    }

    // 显示title、desc 的通知框，dura 为显示多久自动关闭，0为不自动关闭
    openNotification = (type, title, desc, dura) => {
        const key = `open${Date.now()}`;
        const btn = (
          <Button type="primary" size="small" onClick={() => notification.close(key)}>
            Confirm
          </Button>
        );
        notification.open({
          message: title,
          description: desc,
          //btn,
          key,
          type: type,
          duration: dura,
        });
      };

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

        this.state.favoriteList = this.loadFavoriteList();
        this.state.localConfig = this.loadLocalConfig();

        this.changeLanguage(language);

        // 强制执行一次
        setTimeout(() => {
            // 先提前预加载logo。避免使用的时候第一次加载头像失败头像绘制出问题
            console.log('getRegistList');
            const {Sprite} = spritejs;
            const logoSprite = new Sprite(img);
            this.getRegistList();
        }, 1000);
        
        //this.getRegistList();

        // 再设置定时器，拉取最新注册账号，1分钟跑一次，之后改成 5 分钟 todo
        let timerID1 = setInterval(this.getRegistList, 5 * 60 * 1000);
        

        // 4 秒钟执行一次，查看是否有新注册账号，若有，则提示出来
        let timerID2 = setInterval(this.onTimeShowNewDASInfo, 4 * 1000);

        this.setCache(
            {
                discordTimerId: timerID1, 
                showNewDASTimerID: timerID2, 
            });
            
        window.addEventListener('resize', this.handleResize.bind(this)) 
        console.log('main componentWillUnmount end');
    }

    
    handleResize = () => {
        // 只有从小尺寸切换到大尺寸，或从大尺寸切换到小尺寸，才会触发重新计算更新界面
        let lastWidth = this.cacheData.clientWidth;
        let newWidth = document.body.clientWidth;
        if ( (newWidth < 640 && lastWidth > 640 ) || 
             (newWidth > 640 && lastWidth < 640 )) {
            this.setState({isNarrowScreen: newWidth < 640})
        }

        this.setCache({clientWidth: document.body.clientWidth })    
    }

    componentWillUnmount() {
        // use intervalId from the state to clear the interval
        if (this.cacheData.discordTimerId > 0) {
            clearInterval(this.state.discordTimerId);
        }
        
        clearInterval(this.cacheData.showNewDASTimerID);

        window.removeEventListener('resize', this.handleResize.bind(this))
     }

    langConfig = (key) => {
        let locale = this.state.locale;

        return localeConfig[locale][key];
    }
    
    handleTryKeywordSearchClick = () => {
        const { input } = this.kewordInput; // 如果是textArea的话，const { textAreaRef } = this.inputRef;
        input.focus();
        input.setSelectionRange(0, input.value.length);
            // input.select(); // 可全部选中
    };

    handleTryFavoriteListClick = () => {

        let wordList = JSON.stringify(this.state.favoriteList).match(/[a-z0-9]+/gi);

        if (wordList) {
            wordList = [...new Set(wordList)].sort(function (a, b) {
                return a.length - b.length;
            });
        }

        this.state.snsArr = (wordList ? wordList : "");

        this.search();
    }

    handleTryRecommendListClick = () => {
        let section = document.querySelector('#SuggestedList');
        if (section) {
            section.scrollIntoView( { behavior: 'smooth', block: 'start' } );    
        }
        this.refreshRecommendList();
    }

    // 随机加载 10 个账号到精准匹配编辑框中
    loadRandomFrequentWords = () => {
        let wordList = require('../mock/wordlist.json');

        let reserved = das.reserved;
        let registered = das.registered;
        let result = [];

        let wordString = this.langConfig('wordlist-tips');

        // 最多输出 10个
        while (result.length < 10) {
            let index = this.getRandomInt(0, wordList.length);
            let item = wordList[index];
            if (item.length > 9)
                continue;
                
            if (this.canRegister(item)) {
                let account = item + '.bit';
                // 排除
                if (!result.includes(account) && !reserved.includes(account) && !registered.includes(account)) {
                    result.push(item);
                    wordString = wordString + '\n' + item
                }
            }
        }

        console.log(wordString);
        return wordString;
    }

    loadAccountList = (wordList) => {
        let reserved = das.reserved;
        let registered = das.registered;
        let result = [];
        let arr = [];
        for (let i = 0; i < wordList.length; i++) {
            let item = wordList[i];

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
                            status: [DASACCOUNTSTATUS.Available],
                            name: account
                        })
                    }
                }
            }
        }

        if (result.length === 0) {
            this.refreshRecommendList();
        }

        console.log(result)
        this.setState({
            list: result
        });
    } 

    loadFrequentWords = () => {
        let wordList = require('../mock/wordlist.json');
        
        this.loadAccountList(wordList);
    }

    getWordCloudList = () => {
        return das['cloudWord'];
    }

    getDailyRegisteredData = () => {
        return das['dailyRegistered'];
    }

    getDailyUniqueOwnerData = () => {
        return das.ownerStat['daily_new_owner_count'];
    }

    getLastdayRegisteredCount = () => {
        let len = das['dailyRegistered'].length;
        if (len < 2)
            return 0

        return das['dailyRegistered'][len-2]['value']
    }

    getAccountLenStatList = () => {
        return das['accountLen'];
    }

    recentRegDataChanged = (recentRegArray) => {
        if (recentRegArray) {
            das['recentRegData'] = recentRegArray;
            this.setState({dataUpdateFlag: true});
        }
    }

    recentOwnerDataChanged = (recentOwnerArray) => {
        if (recentOwnerArray) {
            das['recentOwnerData'] = recentOwnerArray;
            this.setState({dataUpdateFlag: true});
        }
    }

    getInvitRankList = () => {
        let rankList = [];
        for (let i = 0, dst_len = 0; i < das['invitRank'].length && dst_len < 10; i++) {
            let inviter = das['invitRank'][i];
            if (inviter['name'].length > 0) {
                rankList.push(inviter);
                dst_len++;
            }
        }

        return rankList;
    }

    loadDailyStatUpdatedTime = () => {
        let defTitle = this.langConfig('dailystat-title');
        let updateTime = '';
        if (das.lastUpdateTime) {
            let time = new Date(das.lastUpdateTime);
            updateTime = time.toLocaleDateString() + " " + time.toLocaleTimeString();
        }
            
        return defTitle + updateTime;
    }

    // 显示标签时用到
    getAccountStatusString = (status) => {
        let tips = ""
        switch (status) {
            case DASACCOUNTSTATUS.Available: tips = this.langConfig("das-account-status-available"); 
                break;
            case DASACCOUNTSTATUS.Reserved: tips = this.langConfig("das-account-status-reserved"); 
                break;
            case DASACCOUNTSTATUS.Registering: tips = this.langConfig("das-account-status-registering"); 
                break;
            case DASACCOUNTSTATUS.Registered: tips = this.langConfig("das-account-status-registered"); 
                break;
            case DASACCOUNTSTATUS.NotOpen: tips = this.langConfig("das-account-status-notopen"); 
                break;
            case DASACCOUNTSTATUS.OnSale: tips = this.langConfig("das-account-status-onsale"); 
                break;
            default:break;
        }

        return tips;
    }

    // 显示标签时用到
    getResultFilterString = (status) => {
        let tips = "";
        for ( let i in TABLEFILTER[this.state.locale]) {
            
            let config = TABLEFILTER[this.state.locale][i];
            //console.log(this.state.locale, config)
            if (config['key'] === status) {
                tips = config['name'];
                break;
            }
        }
        
        return tips;
    }

    getAccountStatusLinkTitle = (status) => {
        let title = ""
        switch (status) {
            case DASACCOUNTSTATUS.Available: title = this.langConfig("register-btn"); 
                break;
            case DASACCOUNTSTATUS.OnSale: title = this.langConfig("btn-title-make-offer"); 
                break;
            case DASACCOUNTSTATUS.Reserved: title = this.langConfig("btn-title-claim-reserved"); 
                break;
            case DASACCOUNTSTATUS.Registering: title = this.langConfig("btn-title-view-profile"); 
                break;
            case DASACCOUNTSTATUS.Registered: title = this.langConfig("btn-title-make-offer"); 
                break;
            case DASACCOUNTSTATUS.NotOpen: title = this.langConfig("btn-title-release-rules"); 
                break;
            default: title = this.langConfig("btn-title-release-rules"); 
            break;
        }

        return title;
    }

    numberFormatter = (num, digits) => {
        var si = [
          { value: 1, symbol: "" },
          { value: 1E3, symbol: "K" },
          { value: 1E6, symbol: "M" },
          { value: 1E9, symbol: "G" },
          { value: 1E12, symbol: "T" },
          { value: 1E15, symbol: "P" },
          { value: 1E18, symbol: "E" }
        ];

        // 中文的习惯，使用万，百万。。
        if (this.state.locale.indexOf("zh") !== -1) {
            si = [
                { value: 1, symbol: "" },
                { value: 1E4, symbol: "万" },
                { value: 99999900, symbol: "亿" }
              ];
        }

        var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
        var i;
        for (i = si.length - 1; i > 0; i--) {
          if (num >= si[i].value) {
            break;
          }
        }
        return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
    }
    
    // 考虑到不同状态、不同设备，需要特殊处理列字断
    getTableColumns = () => {
        let columns = [];

        columns.push(
            {
                dataIndex: 'fav',
                key: 'fav', 
                width: 10,                   
                render: (text, record, index) => {
                    if (this.state.favoriteList && this.state.favoriteList.includes(record.name)) {
                        // 自选
                        return <Tooltip placement="topLeft" title={''}>
                            <span className="fa fa-star fa-favorite-sel" onClick={() => this.removeFromFavorite(record.name)}></span>
                        </Tooltip>
                    }
                    else {
                        // 非自选
                        return <Tooltip placement="topLeft" title={this.langConfig('unfavorite-item-tip')}>
                            <span className="fa fa-star fa-favorite-unsel" onClick={() => this.addToFavorite(record.name)}></span>
                        </Tooltip>
                    }
                    
                },
            }
        )
        if (!this.state.isNarrowScreen) {
            columns.push(
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
                            //console.log('avatar drawing')
                            let nameMD5 = md5(record.name)
                            let id = `img${nameMD5}`
                            let dom = <div id={id} style={{width: "32px", height: "32px"}}></div>
                            setTimeout(() => {
                                this.getImg(id, record.name)
                            }, 10)
                            
                            return dom
                        }
                        
                    },
                }
            )
        }
        
        columns.push(
            {
                title: '可选账号',
                dataIndex: 'name',
                key: 'name',
                /*
                render: (text, record, index) =>{
                    return (
                        <div className="das-account-info-wrapper">
                        <div className="das-account-name">{text}</div> 
                        {record.status.map(status => {
                        let color = AccountStatusColors[status];
                      
                        return (
                        <Tag color={color} key={status} className="das-account-status-tag">
                          {this.getAccountStatusString(status)}
                        </Tag>
                        );
                        })}
                        </div>
                    )}*/
            },
            {
                title: '状态',
                key: 'status',
                dataIndex: 'status',
            /*    defaultSortOrder: 'ascend',
                sorter: {
                    compare: (a, b) => a.status[0] - b.status[0],
                },*/
                render: (text, record, index) => (
                  <>
                    {record.status.map(status => {
                        let color = AccountStatusColors[status];
                        //console.log(status);
                        
                        if (status === DASACCOUNTSTATUS.OnSale) {
                            if (record.price) {
                                let value = this.numberFormatter(record.price, 2);
                                return (
                                    <Tag color={color} key={status}>
                                    {this.getAccountStatusString(status)}<span className="das-account-price"> 🍔 {value} CKB</span>
                                    </Tag>
                                );
                            }
                            else {
                                return (
                                    <Tag color={color} key={status}>
                                    {this.getAccountStatusString(status)}
                                    </Tag>
                                );
                            }
                        }
                        else {
                            return (
                                <Tag color={color} key={status}>
                                {this.getAccountStatusString(status)}
                                </Tag>
                            );
                        }
                        
                        })}
                  </>
                ),
            },
            /*{
                title: '价格',
                key: 'price',
                dataIndex: 'price',
                render: (text, record, index) => {
                    if (record.price) {
                        let value = this.numberFormatter(record.price, 2);
                        return <span className="das-account-price">🍔 {value} CKB</span>
                    }
                }
            },*/
            {
                title: '操作',
                width: 100,
                key: 'action',
                align: 'right',
                render: record => {
                    //console.log('record add:' + record.name + ',' + this.state.focusItem)
                    // 状态数组中，第一个状态为注册状态
                    if (record.status[0] === DASACCOUNTSTATUS.Available) {
                        //console.log('record:' + record)
                        // 状态可用，且当前帐号是用户此前选择的账号   
                        if (this.state.focusItem === record.name) {
                            return <div className="dasla-register-container">
                                <div className="dasla-btn-register-wraper">
                            <Tooltip placement="topRight" title={this.langConfig('registry-dename-supprts')}>
                                <Button className="dasla-btn-register-account" size={'normal'} shape="round"
                                onClick={() => this.goDeNameRegister(record)}>{this.langConfig('goto-register-btn')}</Button>
                                <img src={REG_DENAME_LOGO}  alt="" className="image-5"/>
                            </Tooltip>
                            
                            </div>
                            <div className="dasla-btn-register-wraper">
                            <Tooltip placement="topRight" title={this.langConfig('registry-das-supprts')}>
                                <Button className="dasla-btn-register-account" size={'normal'} shape="round"
                                    onClick={() => this.goDASRegister(record)}>{this.langConfig('goto-register-btn')}</Button>
                                <img src={REG_DAS_LOGO}  alt="" className="image-5"/>
                            </Tooltip>
                            </div>
                            </div>        
                        
                        }
                        else {
                            return <Space size="small">
                            <Button className="dasla-btn-select-account" size={'normal'} shape="round"
                                    onClick={() => this.select(record)}>{this.langConfig('register-btn')}</Button>
                        
                            </Space>
                        }
                    }
                    else {
                        let status = record.status[0];
                        if (status === DASACCOUNTSTATUS.OnSale) {
                                return <Space size="small">
                                        <Button className="dasla-btn-select-account" size={'normal'} shape="round"
                                        onClick={() => this.select(record)}>{this.getAccountStatusLinkTitle(status)}</Button>
                                        </Space>
                        }
                        
                        return <Space size="small">
                           <Button type="primary" size={'normal'} shape="round"
                                    onClick={() => this.select(record)}>{this.getAccountStatusLinkTitle(status)}</Button>
                        
                            </Space>
                    }
                },
            }
        )

        return columns;
    }

    handMainTableFilterChange = (value, option) => {
        // 先根据用户当前选择的过滤条件，筛选出符合过滤条件的数据
        //console.log(option);
        let filterList = this.getAccountListByFilter(this.state.mainTableDataList, option.key)

        //console.log('handMainTableFilterChange', filterList.length, value, option.key);
        // 再设置state 刷新界面
        this.setState({
            list: filterList,
            mainTableFilter: option.key
        });
    }

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

        // 精准匹配搜索结果筛选的下拉菜单
        const tableFilters = [];
        TABLEFILTER[this.state.locale].forEach((item) => {
            tableFilters.push(<Option key={item.key}><span className={item.iconClass}></span>{item.name}</Option>);
        })
        
        // 修改标题
        document.title = this.langConfig('app-name');

        let loadFavListBtnDom = <Button onClick={this.handleTryRecommendListClick}>{this.langConfig('empty-try-recommendList')}</Button>
        if (this.state.favoriteList.length > 0) {
            loadFavListBtnDom = <Button type="primary" size={'normal'} shape="round" onClick={this.handleTryFavoriteListClick}><span className="fa fa-star fa-favorite-sel"/>{this.langConfig('empty-try-favoriteList')}</Button>
        }

        let localeAllMatch = {
            emptyText: (
              <span>
                  <div><img src={DAS_LA_LOGO} height='48px' alt="" /></div>
                <p>
                    {this.langConfig('empty-data')}                  
                </p>
                {loadFavListBtnDom}
                <Divider type="vertical"/>
                <Button type="primary" size={'normal'} shape="round" onClick={this.loadFrequentWords}>{this.langConfig('empty-try-load-default')}</Button>
              </span>
            )
        };
        let localeKeywordMatch = {
            emptyText: (
              <span>
                  <div><img src={DAS_LA_LOGO} height='48px' alt="" /></div>
                <p>
                    {this.langConfig('keyword-query-onboard')}   
                </p>
                <Button type="primary" size={'normal'} shape="round" onClick={this.handleTryKeywordSearchClick}>{this.langConfig('empty-try-input-keyword')}</Button>
              </span>
            )
        };
        let localeRecommend = {
            emptyText: (
              <span>
                  <div><img src={DAS_LA_LOGO} height='48px' alt="" /></div>
                <p>
                    {this.langConfig('empty-data')}   
                </p>
                <Button onClick={this.refreshRecommendList}>{this.langConfig('empty-try-recommend-again')}</Button>
              </span>
            )
        };

        return (
            <div>
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
                                return <div key={index}><img alt="" src={value.image}/></div>;
                            })}
                        </Carousel>
                    </div>

                    <div >
                        <Alert style={{
                            marginBottom: 8,
                            borderRadius: 2,
                            textAlign: 'left'}}
                        message={this.langConfig('notification')}
                        banner
                        closable
                        />
                        
                    </div>
                    <Card title={this.langConfig('match-all')} bordered={false} tabBarExtraContent= {<QuestionCircleFilled />}> 
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
                        </div>
                        <div style={{display: 'flex'}}>
                            
                            <div style={{width:'100%'}}>
                                <TextArea onChange={(e) => this.textAreaChange(e)} allowClear placeholder={this.langConfig('wordlist-tips')} 
                                        rows={4}/>
                                
                                
                            </div>
                            
                        </div>
                        <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between', paddingTop:10, height:35}}>
                            <div/>
                            <Space>
                            <span className="fa fa-filter"></span>
                            <Select value={this.getResultFilterString(this.state.mainTableFilter)} onChange={this.handMainTableFilterChange} style={{ width: 190 }}>
                                {tableFilters}
                            </Select>
                            <Button type="primary" shape="round" icon={<SearchOutlined/>}
                                onClick={() => this.search()}>{this.langConfig('wordlist-search')}</Button>
                            </Space>
                        </div>
                        <br/>
                        <Table locale={localeAllMatch} rowKey={(item) => item.id} dataSource={list} columns={this.getTableColumns()}
                               rowClassName='das-account-name noselect' showHeader={false}/>
                        
                    </Card>
                    <br/>
                    <Card title={this.langConfig('keyword-title')} bordered={false}>
                        
                        <div style={{position: 'relative', paddingRight: 0}}>
                            <Input ref={(input) => { this.kewordInput = input; }} onBlur={(e) => this.keywordChanged(e)} placeholder="defi" defaultValue={this.state.keyword} allowClear maxLength={10}
                                   rows={1} style={{textAlign: 'right'}}/>
                            <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between', paddingTop:10, height:35}}>
                                <div/>
                                 
                                <div style={{marginLeft:16, verticalAlign: 'middle', height:'100%', display:'flex'}} >
                                    <div className='group-radio' >
                                        <Radio.Group name="radiogroup" onChange={this.onFixGroupChange} defaultValue={this.state.fix}>
                                            <Radio value={FIXMETHODS.ASPREFIX}>{this.langConfig('keyword-as-prefix')}</Radio>
                                            <Radio value={FIXMETHODS.ASSUFFIX}>{this.langConfig('keyword-as-subfix')}</Radio>
                                        </Radio.Group> 
                                    </div>

                                    <div style={{marginLeft:10}}>
                                        <Button type="primary" shape="round" icon={<SearchOutlined/>}
                                            onClick={() => this.keywordSearch()}>{this.langConfig('keyword-search')}</Button>
                                    </div>
                                    
                                </div>
                                
                            </div>
                        </div>
                        <br/>
                        <Table locale={localeKeywordMatch} rowKey={(item) => item.id} dataSource={keywordList} columns={columns}
                               rowClassName='das-account-name noselect' showHeader={false}/>
                        <br/>
                        <div className='statistic-das-count-title'>
                            {this.langConfig('account-word-cloud-title')}
                        </div>
                        <DASWordCloud dataCallback={this.getWordCloudList} ></DASWordCloud>
                        <br/>
                    </Card>
                    <br/>
                    
                    
                    <Card id="SuggestedList" title={this.langConfig('recommend-title')} bordered={false}
                          extra={<Button type="primary" shape="round" danger 
                                         onClick={() => this.refreshRecommendList()}>{this.langConfig('recommend-change-list')}</Button>}>
                        
                        <Table locale={localeRecommend} rowKey={(item) => item.id} dataSource={recommendList} columns={columns}
                               rowClassName='das-account-name noselect' showHeader={false}/>
                    </Card>
                    <br/>
                    
                    <DASPopularCardList parent={this} getDASAvata={this.getImg} langConfig={this.langConfig}/>
                    
                    <br/>

                    <Card title={this.langConfig('das-big-data')} bordered={false}>
                        
                        <DASStatisticSummary langConfig={this.langConfig} recentRegData={das.recentRegData} recentOwnerData={das.recentOwnerData}/>                 
                        <br/>
                        <div className='statistic-daily-container'>
                            <DailyRegCountChart langConfig={this.langConfig} dataUpdateCallback={this.recentRegDataChanged}/>
                            <br/>
                            <DailyOwnerCountChart langConfig={this.langConfig} dataUpdateCallback={this.recentOwnerDataChanged}/>
                        </div>
                        <br/>
                        <div className='statistic-das-count-title'>
                            {this.langConfig('account-length-distribution-title')}
                            <a href={this.langConfig('das-limit-link')} target="_blank" rel="noopener noreferrer" >{this.langConfig('das-limit-info')}</a>
                        </div>
                        <DASTreemap loadConfigCallback={this.langConfig} dataCallback={this.getAccountLenStatList} ></DASTreemap>
                        
                        <br/>
                        <div className='statistic-das-count-title'>
                            {this.langConfig('inviter-rank-title')}
                        </div>
                        <DASInvitesLeaderboard></DASInvitesLeaderboard>
                        
                    </Card>
                    <br/>
                    
                    <DASMarketCardList parent={this} getDASAvata={this.getImg} langConfig={this.langConfig}/> 

                    <DASAccountShow langConfig={this.langConfig}/>

                </div>
                
            </div>
            <DaslaFooter linkResources={das.linkResources} locale={this.state.locale} langConfig={this.langConfig}/>
            </div>
        )

    }
}

